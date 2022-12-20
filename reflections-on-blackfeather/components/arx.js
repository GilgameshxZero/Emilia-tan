import { registerComponent } from "../component.js";
import "./storyworld-portal.js";
import "./neon.js";

registerComponent(
	`arx`,
	class extends HTMLElement {
		onDomLoad() {
			this.resourceLoad.then(() => {
				this.shadowRoot
					.querySelector(`emilia-neon`)
					.addEventListener(`click`, () => {
						document.querySelector(`emilia-underlay`).toCoast();
					});
			});
		}
	}
);
