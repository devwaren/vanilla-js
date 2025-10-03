// auto-register-runtime.js
function autoRegister() {
    const allTags = new Set();
    document.querySelectorAll('*').forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        if (!tagName.includes('-')) return; // Only register custom tags with a dash
        allTags.add(tagName);
    });

    allTags.forEach(tag => {
        if (!customElements.get(tag)) {
            customElements.define(tag, class extends HTMLElement {
                connectedCallback() {
                    this.innerHTML = `<div style="padding:10px;background:#eee;">${tag} (Auto)</div>`;
                }
            });
        }
    });
}


export { autoRegister };