import { HTML } from "imperative-html/dist/esm/elements-strict";
import { Prompt } from "./Prompt";
import { SongDocument } from "./SongDocument";
import { SongEditor } from "./SongEditor";
import { EditorConfig } from "./EditorConfig";
import { ChangePreset } from "./changes";

const { button, div, h2 } = HTML;

export class InstrumentBrowserPrompt implements Prompt {
	private readonly _closeButton: HTMLButtonElement = button({class: "cancelButton"});
		
	public readonly container: HTMLDivElement;
    private readonly _songEditor: SongEditor;
    public readonly rightSide: HTMLDivElement;
	public catNum: number;
	public readonly isNoise: boolean;
		
	constructor(private _doc: SongDocument, _songEditor: SongEditor) {
		this._songEditor = _songEditor;
		this.isNoise = _doc.song.getChannelIsNoise(_doc.channel);
		
		let message: HTMLDivElement;
		message = div(h2("Instrument Browser"));
		
		let grid: HTMLDivElement;
		let leftSide: HTMLDivElement;
		leftSide = div({style: "width:calc(30% - 10px);height:90%;border-style:solid", class: "instrumentbrowser-list"});
		this.rightSide = div({style: "width:calc(70% - 10px);height:90%;border-style:solid", class: "instrumentbrowser-list"});
		EditorConfig.presetCategories.forEach((a) => {
			if (a.name == "Custom Instruments" || a.presets.some((b) => (b.isNoise == true) === this.isNoise)) {
				leftSide.append(button({onclick: () => this.categoryClick(EditorConfig.presetCategories.indexOf(a))}, a.name));
			}
		});
		leftSide.children[0].after(button({onclick: () => this.categoryRandomClick()}, "Random"))
		grid = div({style: "height: 100%; display:flex"}, leftSide, this.rightSide);
		
		this.container = div({class: "prompt", style: "max-width: calc(97vw - 5vh); width: calc(60vw + 30vh); max-height: calc(97vh - 5vw); height: calc(60vh + 20vw)"},
			message,
			grid,
			this._closeButton,
		);
		
		setTimeout(()=>this._closeButton.focus());
		
		this._closeButton.addEventListener("click", this._close);
	}
		
	private _close = (): void => { 
		this._doc.undo();
	}
		
	public cleanUp = (): void => { 
		this._closeButton.removeEventListener("click", this._close);
	}
	
	public categoryClick = (i: number): void => {
		this.catNum = i;
		this.rightSide.replaceChildren();
		EditorConfig.presetCategories[i].presets.forEach((a) => {
			if ((a.isNoise == true || (i == 0 && ["spectrum", "drumset"].includes(a.name))) === this.isNoise || (i == 0 && a.name == "noise")) {
				this.rightSide.append(button({onclick: () => this.presetClick(EditorConfig.presetCategories[i].presets.indexOf(a))}, a.name));
			}
		});
	}
	
	public categoryRandomClick = (): void => {
		this.catNum = -1;
		this.rightSide.replaceChildren();
		[{name:"Random Preset",id:-100},{name:"Random Generated",id:-101}].forEach((a) => {
			this.rightSide.append(button({onclick: () => this.presetClick(a.id)}, a.name));
		});
	}
	
	public presetClick = (i: number): void => {
		this._doc.prompt = null;
		if (this.catNum == -1) {
			if (i == -100)
				this._songEditor._randomPreset();
			else if (i == -101)
				this._songEditor._randomGenerated();
		} else {
			//console.log("Click "+i+" with name "+EditorConfig.presetCategories[this.catNum].presets[i].name);
			//console.log("Click Index "+((this.catNum << 6) + i));
			const result: number = ((this.catNum << 6) + i);
			this._doc.record(new ChangePreset(this._doc, result));
		}
	}
}
