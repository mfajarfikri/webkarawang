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
import { Card, EmptyState } from "@/Components/Dashboard/ui";
import DateRangeField from "./DateRangeField";
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

function ChartPanel({ title, description, isEmpty, children }) {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-100 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-ink-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            <div className="relative mt-4 h-80 w-full">
                {isEmpty ? (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
                        <EmptyState
                            icon={FaChartBar}
                            title="Tidak ada data"
                            description="Tidak ada anomali yang cocok dengan filter. Ubah periode atau reset filter."
                        />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

function countActiveFilters(filters, defaults) {
    let count = 0;
    if (filters.startDate || filters.endDate) count += 1;
    if (filters.status !== "all") count += 1;
    if (filters.category !== "all") count += 1;
    if (defaults && filters.ultg !== defaults.ultg) count += 1;
    return count;
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
    defaultFilters,
}) {
    const showUltg = ultgOptions.length > 1;
    const activeCount = countActiveFilters(filters, defaultFilters);
    const isEmpty = data.length === 0;

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
                    disabled={activeCount === 0}
                    className="btn-ghost btn-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FaUndo className="h-3 w-3" aria-hidden="true" />
                    Reset
                    {activeCount > 0 ? (
                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                            {activeCount}
                        </span>
                    ) : null}
                </button>
            }
        >
            <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                    showUltg ? "xl:grid-cols-5" : "xl:grid-cols-4"
                }`}
            >
                <div className="sm:col-span-2">
                    <DateRangeField
                        label="Periode kejadian"
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        today={today}
                        onChange={({ startDate, endDate }) => {
                            onFilterChange("startDate", startDate);
                            onFilterChange("endDate", endDate);
                        }}
                    />
                </div>
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
                    isEmpty={isEmpty}
                >
                    <Bar
                        data={buildStageByCategoryData(data, today)}
                        options={stageChartOptions}
                    />
                </ChartPanel>
                <ChartPanel
                    title="Distribusi bagian dan tipe"
                    description="Jumlah anomali per bagian, dipisah Major dan Minor."
                    isEmpty={isEmpty}
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
