import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Bisa log ke service eksternal di sini
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center text-red-600 bg-red-50 rounded">
                    <h2 className="font-bold text-lg mb-2">
                        Terjadi Kesalahan
                    </h2>
                    <div>
                        {this.state.error?.message ||
                            "Ada error pada tampilan."}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
