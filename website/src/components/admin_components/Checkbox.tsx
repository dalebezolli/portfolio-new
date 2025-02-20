type CheckBoxProps = {
    value?: string;
    name?: string;
    checked?: boolean;
    onClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function Checkbox({
    value="",
    name="",
    checked,
    onClick,
}: CheckBoxProps) {
    return (
        <div className="w-fit flex gap-3 items-center">
            <div className="relative">
                <input
                    type="checkbox"
                    id={name + '-' + value}
                    value={value}
                    name={name}
                    checked={checked}
                    className="peer w-[24px] h-[24px] absolute top-0 left-0 z-10 opacity-0 cursor-pointer"
                    onChange={onClick}
                />
                <button
                    className="
                flex gap-1.5 items-center
                w-fit px-1 py-1
                rounded-lg border-2 border-gray-700
                bg-gray-800 peer-checked:bg-violet-600

                transition-colors duration-200
                after:contents-[''] after:inset-4 after:p-2 after:rounded-full after:bg-radio-default-inner not:peer-checked:after:opacity-100 peer-checked:after:opacity-0
                "></button>
            </div>
        </div>
    );
}
