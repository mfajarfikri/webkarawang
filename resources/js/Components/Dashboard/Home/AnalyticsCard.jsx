import {
    Field,
    Label,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import { Bar } from "react-chartjs-2";
import { FaChartBar, FaCheck, FaChevronDown, FaUndo } from "react-icons/fa";
import { Card } from "@/Components/Dashboard/ui";
import {
    buildDistributionData,
    buildStageByCategoryData,
    distributionChartOptions,
    stageChartOptions,
} from "./analyticsCharts";

export const STATUS_OPTIONS = [
    { value: "all", label: "Semua status" },
    ...["New", "Open", "In Progress", "Pending", "Close"].map((status) => ({
        value: status,
        label: status,
    })),
];

function FilterListbox({ label, value, options, onChange }) {
    const selected = options.find((option) => option.value === value);
    return (
        <Field className="min-w-0">
            <Label className="field-label">{label}</Label>
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <ListboxButton className="field-input relative cursor-pointer pr-10 text-left">
                        <span className="block truncate">
                            {selected?.label ?? "Pilih"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaChevronDown
                                className="h-3 w-3 text-slate-400"
                                aria-hidden="true"
                            />
                        </span>
                    </ListboxButton>
                    <ListboxOptions
                        transition
                        className="absolute z-30 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lift focus:outline-none data-[closed]:opacity-0 data-[leave]:transition data-[leave]:duration-100"
                    >
                        {options.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-slate-700 data-[focus]:bg-brand-50 data-[focus]:text-brand-800"
                            >
                                <span className="block truncate group-data-[selected]:font-semibold">
                                    {option.label}
                                </span>
                                <span className="absolute inset-y-0 right-0 hidden items-center pr-3 text-brand-600 group-data-[selected]:flex">
                                    <FaCheck
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                </span>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </Field>
    );
}

function DateField({ id, label, value, onChange }) {
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="field-label">
                {label}
            </label>
            <input
                id={id}
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="field-input"
            />
        </div>
    );
}

function ChartPanel({ title, description, children }) {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-100 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-ink-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            <div className="relative mt-4 h-80 w-full">{children}</div>
        </div>
    );
}

/**
 * Filter analisis (tanggal, status, kategori, ULTG) dan dua grafik:
 * tahap per kategori dan distribusi bagian/tipe.
 */
export default function AnalyticsCard({
    data,
    today,
    filters,
    categoryOptions,
    ultgOptions,
    onFilterChange,
    onReset,
}) {
    const showUltg = ultgOptions.length > 1;

    return (
        <Card
            title="Analisis anomali"
            description={`${data.length} anomali sesuai filter`}
            icon={FaChartBar}
            clip={false}
            actions={
                <button
                    type="button"
                    onClick={onReset}
                    className="btn-ghost btn-sm"
                >
                    <FaUndo className="h-3 w-3" aria-hidden="true" />
                    Reset
                </button>
            }
        >
            <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                    showUltg ? "xl:grid-cols-5" : "xl:grid-cols-4"
                }`}
            >
                <DateField
                    id="filter-start"
                    label="Tanggal mulai"
                    value={filters.startDate}
                    onChange={(value) => onFilterChange("startDate", value)}
                />
                <DateField
                    id="filter-end"
                    label="Tanggal akhir"
                    value={filters.endDate}
                    onChange={(value) => onFilterChange("endDate", value)}
                />
                <FilterListbox
                    label="Status"
                    value={filters.status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => onFilterChange("status", value)}
                />
                <FilterListbox
                    label="Kategori"
                    value={filters.category}
                    options={categoryOptions}
                    onChange={(value) => onFilterChange("category", value)}
                />
                {showUltg ? (
                    <FilterListbox
                        label="ULTG"
                        value={filters.ultg}
                        options={ultgOptions}
                        onChange={(value) => onFilterChange("ultg", value)}
                    />
                ) : null}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartPanel
                    title="Tahap proses per kategori"
                    description="Posisi anomali di alur proses, dikelompokkan per kategori."
                >
                    <Bar
                        data={buildStageByCategoryData(data, today)}
                        options={stageChartOptions}
                    />
                </ChartPanel>
                <ChartPanel
                    title="Distribusi bagian dan tipe"
                    description="Jumlah anomali per bagian, dipisah Major dan Minor."
                >
                    <Bar
                        data={buildDistributionData(data)}
                        options={distributionChartOptions}
                    />
                </ChartPanel>
            </div>
        </Card>
    );
}
