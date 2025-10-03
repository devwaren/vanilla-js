
const useJSloadBrython = async () => {
    const brythonJS = "https://cdn.jsdelivr.net/npm/brython@3/brython.min.js";
    const brythonStdlib = "https://cdn.jsdelivr.net/npm/brython@3/brython_stdlib.js";

    // Utility function to load a script
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    };

    // Load both scripts sequentially
    await loadScript(brythonJS);
    await loadScript(brythonStdlib);

    // Call brython() after scripts are loaded
    if (typeof window.brython === "function") {
        window.brython();
    } else {
        console.error("Brython did not load correctly.");
    }
};



const loadPyFiles = (src) =>
    new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/python";
        script.src = `/src/python/${src}`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
    });

export { useJSloadBrython, loadPyFiles };
