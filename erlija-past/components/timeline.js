import { registerComponent } from "../../scripts/component.js";
import "./tag-menu.js";
import "./icon.js";
import "./snapshot-menu.js";

registerComponent(
	`timeline`,
	`erlija-past`,
	class extends HTMLElement {
		onDomLoad() {
			// Update URL.
			document.title = `timeline | erlija`;
			history.pushState(null, ``, `/`);

			// Resolve subcomponentLoad before any tag selection.
			this.subcomponentLoad = new Promise((resolve) => {
				const tagMenu = this.shadowRoot.querySelector(`emilia-tag-menu`);
				const icon = this.shadowRoot.querySelector(`emilia-icon`);
				Promise.all([
					this.resourceLoad,
					tagMenu.resourceLoad,
					icon.resourceLoad
				]).then(() => {
					Promise.all([tagMenu.subcomponentLoad, icon.subcomponentLoad]).then(
						() => {
							this.classList.add(`loaded`);
							resolve();
						}
					);
				});
			});

			this.tags = {
				p794: {
					name: `Project 794`,
					tagline: `Personal newsletters and life updates.`
				},
				alto: {
					name: `Alto`,
					tagline: `Long-form technical project write-ups.`
				},
				cygnus: {
					name: `Cygnus-Sylph`,
					tagline: `Worldbuilding in short stories and poetry.`
				},
				utulek: {
					name: `Útulek`,
					tagline: `Technical problem-solving.`
				}
			};
			this.snapshots = {};
			this.snapshotsLoad = Promise.all(
				Object.keys(this.tags).map((tag) => {
					return fetch(`api/snapshots/${tag}.json`)
						.then((res) => {
							return res.json();
						})
						.then((json) => {
							this.snapshots[tag] = json;

							// Store date of latest snapshot for each tag.
							this.tags[tag].date =
								json.snapshots[json.snapshots.length - 1].date;
						});
				})
			);

			// Click handler for map button.
			this.shadowRoot
				.querySelector(`emilia-icon`)
				.addEventListener(`click`, () => {
					this.parentNode.host.toMap();
				});
		}

		onTagSelect(tag) {
			// Subsequent tag selections do not unload the timeline.
			this.tagSelected = tag;
			const snapshotMenu =
				this.shadowRoot.querySelector(`emilia-snapshot-menu`);
			snapshotMenu.onMenuReset(this.snapshots[tag].snapshots);

			// Add new click handlers for new snapshot menu items.
			snapshotMenu.subcomponentLoad.then(() => {
				const snapshotItems = [
					...snapshotMenu.shadowRoot.querySelectorAll(
						`emilia-snapshot-menu-item`
					)
				];
				Promise.all(
					snapshotItems.map((item) => {
						return item.resourceLoad;
					})
				).then(() => {
					snapshotItems.forEach((item) => {
						item.addEventListener(`click`, () => {
							// Call landing handler.
							this.parentNode.host.toSnapshot(item.getAttribute(`path`));
						});
					});
				});
			});
		}
	}
);
