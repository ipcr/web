import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';
import React from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Link,
} from "react-router-dom";
import IPFS from 'ipfs';

// I could not get ipfs.resolve('/ipns/QmTw9u8R3FCh2DR1t6PvkWibVnZXJfujzEKV2o4SRrTPLV') working in a browser.
// See https://github.com/ipfs/js-ipfs/issues/2921 for more details.
// Therefore, I had to hardcode container registry CID here and update it every time I update the registry.
const REGISTRY_CID = '/ipfs/QmTHQCVUNgKPTncgw4t1EuhHhxrL4kPLWSkEgyx3pmpRoo'

class ErrorBoundary extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    componentDidCatch(error) {
        this.setState({error: error});
    }

    render() {
        if (this.state.error) {
            return (
                <div className="alert alert-danger" role="alert">
                    {this.state.error.message}
                </div>
            );
        }
        return this.props.children;
    }
}

class Loading extends React.PureComponent {
    render() {
        return (
            <div className="text-center mt-4">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
        );
    }
}

class ImageDetails extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            error: null,
        };
    }

    async componentDidMount() {
        const { params } = this.props.match;
        try {
            const imagePath = REGISTRY_CID + '/' + params.image;
            const descriptionPath =  imagePath + '/' + 'README-short.txt';
            const tagsPath = imagePath + '/' + 'tags';

            const chunks = [];
            for await (const chunk of this.props.ipfs.cat(descriptionPath)) {
                chunks.push(chunk);
            }
            const description = Buffer.concat(chunks).toString();

            const tags = [];
            for await (const tag of this.props.ipfs.ls(tagsPath)) {
                tags.push(tag.name)
            }

            this.setState({image: {
                name: params.image,
                description: description,
                tags: tags,
            }});
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        if (this.state.error) {
            throw this.state.error;
        }
        if (this.state.image) {
            const tagsCardStyle = {
                width: '18rem',
            };
            const commandsCardStyle = {
                width: '34rem',
            };
            return (
                <div className="row">
                    <div className="col-6">
                        <h2>{this.state.image.name}</h2>
                        {this.state.image.description}
                        <div className="card mt-4" style={tagsCardStyle}>
                            <div className="card-header">
                                Tags
                            </div>
                            <ul className="list-group list-group-flush">
                                {this.state.image.tags.map(tag => (
                                    <li className="list-group-item" key={tag}>{tag}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Pull commands</h5>
                                    <small className="card-text text-monospace">
                                        $ ipfs get -o {this.state.image.name}:latest /ipns/containers.zanko.dev/{this.state.image.name}/tags/latest<br/>
                                        $ tar --strip-components 1 -cf - {this.state.image.name}:latest | docker load
                                    </small>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return <Loading />;
    }
}

class ImageList extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            images: [],
            error: null,
        };
    }

    async componentDidMount() {
        try {
            for await (const img of this.props.ipfs.ls(REGISTRY_CID)) {
                this.setState(state => {
                    return {
                        images: [...state.images, img],
                        error: null,
                    };
                });
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        if (this.state.error) {
            throw this.state.error;
        }
        if (this.state.images.length) {
            return (
                <div>
                    {this.state.images.map(img => (
                        <Link className="btn btn-light btn-lg btn-block" key={img.path} to={img.name}>{img.name}</Link>
                    ))}
                </div>
            );
        }
        return <Loading />;
    }
}

class App extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            ipfs: null,
            error: null,
        };
    }

    async componentDidMount() {
        try {
            const ipfs = await IPFS.create({
                libp2p: {
                    config: {
                        dht: {
                            enabled: true,
                            clientMode: true,
                        },
                    },
                },
            });
            this.setState({ipfs: ipfs});
        } catch (error) {
            this.setState({error: error});
        }
    }

    async componentWillUnmount() {
        if (this.state.ipfs) {
            await this.state.ipfs.stop()
        }
    }

    render() {
        if (this.state.error) {
            throw this.state.error;
        }
        if (!this.state.ipfs) {
            return <Loading />;
        }
        return (
            <Switch>
                <Route exact path="/" render={(props) => <ImageList {...props} ipfs={this.state.ipfs} />} />
                <Route path="/:image" render={(props) => <ImageDetails {...props} ipfs={this.state.ipfs} />} />
            </Switch>
        );
    }
}

ReactDOM.render(
    <Router>
        <ErrorBoundary>
            <App/>
        </ErrorBoundary>
    </Router>,
    document.getElementById('app')
);