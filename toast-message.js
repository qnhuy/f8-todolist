class ToastMessage extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    show(content) {
        // get toast message template
        this._template = $('#toastMessageTpl').content.cloneNode(true)

        // assign toast content
        const toastContent = this._template.querySelector('.toast-content')
        toastContent.innerText = content

        this.shadowRoot.appendChild(this._template)
        const toastEle = $('#toast')
        toastEle.appendChild(this)

        this.shadowRoot.querySelector('.toast-close').onclick = () => this.remove()
        if (this) {
            setTimeout(() => this.remove(), 4300)
        }
    }
}

customElements.define('toast-message', ToastMessage)