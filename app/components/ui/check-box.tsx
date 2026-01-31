interface CheckBoxProps {
    isChecked:boolean,
    onToggle:()=>void,
    label:string
}
const CustomerCheckBox = ({isChecked,onToggle,label}:CheckBoxProps) => {

    const classNameButton = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? 'bg-[#0033a0]' : 'bg-gray-300'}`;
    const classNameSpan = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`;
    return (
        <div className="flex items-center justify-between p-3 border-b border-zinc-400">
            <label htmlFor="isCapitecClient" className="text-sm font-medium text-[#1E313E]">
                {label}
            </label>
            <button
                type="button"
                id="isCapitecClient"
                role="switch"
                aria-checked={isChecked}
                onClick={onToggle }
                className={classNameButton}
            >
                            <span
                                className={classNameSpan}
                            />
            </button>
        </div>
    );
};

export default CustomerCheckBox;