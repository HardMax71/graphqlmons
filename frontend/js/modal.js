class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.title = this.modal.querySelector('.modal-card-title');
        this.content = this.modal.querySelector('.modal-card-body');
        this.closeButton = this.modal.querySelector('.delete');
        this.background = this.modal.querySelector('.modal-background');
        
        this.closeButton.addEventListener('click', () => this.hide());
        this.background.addEventListener('click', () => this.hide());
    }

    show(title, content) {
        this.title.textContent = title;
        this.content.innerHTML = content;
        this.modal.classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    hide() {
        this.modal.classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }
}

const modal = new Modal();