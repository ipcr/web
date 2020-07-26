import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom';
import React from 'react';
import IPFS from 'ipfs';

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
            const ipfs = await IPFS.create();
            
            for await (const img of ipfs.ls('/ipfs/QmdtQjb1hRxH5KUdYVxktTG9q3LseiQJEjhy9jeWNVqA79')) {
                console.log(img);
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
                        <a href="#" className="btn btn-light btn-lg btn-block" key={img.path}>{img.name}</a>
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
        );
    }
}

class App extends React.PureComponent {
    render() {
        return (
            <ErrorBoundary>
                <ImageList/>
            </ErrorBoundary>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('app')
);