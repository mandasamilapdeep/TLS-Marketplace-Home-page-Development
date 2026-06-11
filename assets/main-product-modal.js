class ProductModal extends ModalDialog {
	constructor() {
		super();
	}

	hide() {
		removeTrapFocus();
		super.hide();
		window.pauseAllMedia();
	}

	show(opener) {
		super.show(opener);

		this.addEventListener(
			"transitionend",
			() => {
				const containerToTrapFocusOn = this;
				const focusElement = this.querySelector(".product-media-modal__dialog");
				trapFocus(containerToTrapFocusOn, focusElement);
			},
			{ once: true },
		);

		this.showActiveMedia();
	}

	showActiveMedia() {
		const activeMedia = this.querySelector(
			`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`,
		);

		if (
			activeMedia.nodeName == "DEFERRED-MEDIA" &&
			activeMedia
				.querySelector("template")
				?.content?.querySelector(".js-youtube")
		) {
			activeMedia.loadContent();
		}
	}
}

customElements.define("product-modal", ProductModal);
