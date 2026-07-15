import { Component, input, type OnInit, signal } from "@angular/core";
import {
	ArrowDownFromLine,
	ArrowRight,
	ArrowUpFromLine,
	Ban,
	Building,
	Check,
	ChevronDown,
	ChevronRightIcon,
	ChevronsUpDown,
	ChevronUp,
	CircleCheck,
	CircleOff,
	CircleX,
	Cog,
	Columns2,
	Container,
	Copy,
	EllipsisVertical,
	Eraser,
	Eye,
	FileDown,
	FileUp,
	FlaskConical,
	History,
	Info,
	Key,
	Layers,
	LogOut,
	LucideAngularModule,
	type LucideIconData,
	Mail,
	MonitorSmartphone,
	Palette,
	PanelRightClose,
	PanelRightOpen,
	Paperclip,
	Pause,
	Play,
	Plus,
	RotateCcw,
	Rows2,
	Save,
	Search,
	Send,
	Server,
	ServerOff,
	Sparkles,
	SquarePen,
	SquareTerminal,
	Timer,
	Trash2,
	User,
	UserRoundPlus,
	WandSparkles,
	X,
} from "lucide-angular";

export const SystemIcon = {
	Workspace: Building,
	Collection: Layers,
	Environment: Container,
	Request: Send,
	RequestExample: FlaskConical,
	Mock: WandSparkles,
	MockServer: Server,
	MockServerOff: ServerOff,
	History: History,

	// Elements
	ChevronRight: ChevronRightIcon,
	ChevronDown: ChevronDown,
	ChevronUp: ChevronUp,
	Info: Info,
	Settings: Cog,
	Dropdown: ChevronsUpDown,
	Attachment: Paperclip,
	Console: SquareTerminal,
	Theme: Palette,
	Options: EllipsisVertical,
	DataUploaded: ArrowUpFromLine,
	DataDownloaded: ArrowDownFromLine,
	Timer: Timer,
	User: User,
	Email: Mail,
	// Layout
	HorizontalLayout: Rows2,
	VerticleLayout: Columns2,
	ResponsiveLayout: MonitorSmartphone,

	// Actions
	Plus: Plus,
	View: Eye,
	Cancel: X,
	Clear: Eraser,
	Hide: Key,
	Save: Save,
	CloseSidebar: PanelRightClose,
	OpenSidebar: PanelRightOpen,
	Invite: UserRoundPlus,
	Export: FileDown,
	Import: FileUp,
	Tick: Check,
	Send: ArrowRight,
	Rename: SquarePen,
	Delete: Trash2,
	Copy: Copy,
	Search: Search,
	Logout: LogOut,
	Start: Play,
	Stop: Pause,
	Retry: RotateCcw,
	Format: Sparkles,

	//Status
	Failed: CircleX,
	Success: CircleCheck,
	Empty: Ban,
	Aborted: CircleOff,
} as const;

@Component({
	selector: "i[gurl-icon]",
	template: ` 
        <lucide-angular [img]="img()"
        [class]="className() ? className(): ''"
        />
    `,
	imports: [LucideAngularModule],
})
export class SystemIconComponent implements OnInit {
	public icon = input.required<keyof typeof SystemIcon>();
	public img = signal<LucideIconData | undefined>(undefined);
	public className = input<string>("");

	ngOnInit(): void {
		this.img.set(SystemIcon[this.icon()]);
	}
}
