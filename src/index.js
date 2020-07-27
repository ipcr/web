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

const REGISTRY_CID = '/ipfs/QmdtQjb1hRxH5KUdYVxktTG9q3LseiQJEjhy9jeWNVqA79'

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
            <div className="text-center">
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
            const descriptionCID = REGISTRY_CID + '/' + params.image  + '/' + 'README-short.txt';
            const chunks = [];

            for await (const chunk of this.props.ipfs.cat(descriptionCID)) {
                chunks.push(chunk);
            }
            const description = Buffer.concat(chunks).toString();

            this.setState({image: {
                name: params.image,
                description: description,
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
            return (
                <div>
                    <h1>{this.state.image.name}</h1>
                    <h2>{this.state.image.description}</h2>
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
            const ipfs = await IPFS.create();
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