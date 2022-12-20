import {
	prependRelativePaths,
	registerComponent
} from "../../scripts/component.js";
import "./icon.js";

registerComponent(
	`snapshot`,
	`erlija-past`,
	class extends HTMLElement {
		onDomLoad() {
			// Snapshots are fake subcomponentLoaded immediately, but again when the snapshot path is set. The firts subcomponentLoad is for the two icons.
			const icons = [...this.shadowRoot.querySelectorAll(`emilia-icon`)];
			this.subcomponentLoad = new Promise((resolve) => {
				Promise.all([
					this.resourceLoad,
					...icons.map((icon) => {
						return icon.resourceLoad;
					})
				]).then(() => {
					Promise.all(
						icons.map((icon) => {
							return icon.subcomponentLoad;
						})
					).then(() => {
						resolve();
					});
				});
			});

			// Set click handlers for both icons to go back to timeline.
			icons.forEach((icon) => {
				icon.addEventListener(`click`, () => {
					this.parentNode.host.toTimeline();
				});
			});
		}

		// Actually load the snapshot text, and reset subcomponentLoad. resourceLoad is completed at this point.
		setPath(path) {
			this.subcomponentLoad = new Promise((resolve) => {
				fetch(`snapshots/${path}.html`)
					.then((res) => {
						return res.text();
					})
					.then((html) => {
						// We now have the snapshot HTML in text.
						const fragmentClone = new DOMParser()
							.parseFromString(html, "text/html")
							.querySelector(`template`)
							.content.cloneNode(true);
						prependRelativePaths(fragmentClone, "../snapshots/");
						this.shadowRoot.querySelector(`article`).appendChild(fragmentClone);

						// <table> postprocessor to wrap them all in a h-scrollable div (the markdown converter doesn’t support this).
						this.shadowRoot.querySelectorAll(`table`).forEach((table) => {
							const wrapper = document.createElement(`div`);
							wrapper.classList.add(`table-wrapper`);
							table.parentNode.insertBefore(wrapper, table);
							wrapper.appendChild(table);
						});

						// Update URL. Remove .html extension.
						document.title = `${path} | erlija`;
						history.pushState(null, ``, `/snapshots/${path}`);

						// Display the essay as soon as fonts are loaded!
						document.fonts.ready.then(() => {
							this.classList.add(`loaded`);
							requestAnimationFrame(() => {
								// Process and jump to any ID fragment. Must be done after transition has begun, or else opacity is still 0.
								const fragment = window.location.hash;
								if (fragment.length > 0) {
									history.replaceState(
										null,
										``,
										window.location.pathname + window.location.search
									);
									const fragmentElement =
										this.shadowRoot.querySelector(fragment);
									if (fragmentElement) {
										fragmentElement.scrollIntoView();
									}
								}
								resolve();
							});
						});
					});
			});
		}
	}
);
