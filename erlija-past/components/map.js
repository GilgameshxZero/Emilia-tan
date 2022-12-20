import { registerComponent } from "../../scripts/component.js";

registerComponent(
	`map`,
	`erlija-past`,
	class extends HTMLElement {
		onDomLoad() {
			document.title = `map | erlija`;
			history.pushState(null, ``, `/map`);

			// Click handler to go back to timeline.
			const icon = this.shadowRoot.querySelector(`emilia-icon`);
			icon.addEventListener(`click`, () => {
				this.parentNode.host.toTimeline();
			});

			this.subcomponentLoad = new Promise((resolve) => {
				Promise.all([this.resourceLoad, icon.resourceLoad]).then(() => {
					icon.subcomponentLoad.then(() => {
						this.classList.add(`loaded`);
						resolve();
					});
				});
			});
		}
	}
);
