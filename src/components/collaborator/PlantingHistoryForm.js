import { Form, Select, DatePicker } from "antd";
import { Minus, X } from "lucide-react";
import { useEffect } from "react";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// Mobile-friendly styles for RangePicker
const mobileRangePickerStyle = `
.mobile-range-picker .ant-picker-panels {
    flex-direction: column !important;
}
.mobile-range-picker .ant-picker-panel {
    width: 100% !important;
}
.mobile-range-picker .ant-picker-header {
    padding: 4px 8px !important;
}
.mobile-range-picker .ant-picker-cell {
    padding: 2px !important;
}
.mobile-range-picker .ant-picker-dropdown {
    max-width: 90vw !important;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = mobileRangePickerStyle;
    if (!document.head.querySelector('style[data-mobile-range-picker]')) {
        styleElement.setAttribute('data-mobile-range-picker', 'true');
        document.head.appendChild(styleElement);
    }
}

const optionCommodity = [
    { label: 'Padi', value: 'padi' },
    { label: 'Jagung', value: 'jagung' },
    { label: 'Tebu', value: 'tebu' },
    { label: 'Lainnya', value: 'other' },
];

export default function PlantingHistoryForm({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData 
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const formattedData = {
                    ...initialData,
                    commodity_mt_1: initialData?.commodity_mt_1 || undefined,
                    commodity_mt_2: initialData?.commodity_mt_2 || undefined,
                    commodity_mt_3: initialData?.commodity_mt_3 || undefined,
                    // Format date ranges for RangePicker
                    date_range_mt_1: initialData?.tanam_mt_1 && initialData?.panen_mt_1 ? 
                        [dayjs(initialData.tanam_mt_1, 'YYYY-MM'), dayjs(initialData.panen_mt_1, 'YYYY-MM')] : undefined,
                    date_range_mt_2: initialData?.tanam_mt_2 && initialData?.panen_mt_2 ? 
                        [dayjs(initialData.tanam_mt_2, 'YYYY-MM'), dayjs(initialData.panen_mt_2, 'YYYY-MM')] : undefined,
                    date_range_mt_3: initialData?.tanam_mt_3 && initialData?.panen_mt_3 ? 
                        [dayjs(initialData.tanam_mt_3, 'YYYY-MM'), dayjs(initialData.panen_mt_3, 'YYYY-MM')] : undefined,
                };
                form.setFieldsValue(formattedData);
            } else {
                form.resetFields();
            }
        }
    }, [initialData, form, isOpen]);

    const handleFinish = () => {
        const values = form.getFieldsValue();
        const formattedValues = {
            ...values,
            // Extract start and end dates from range pickers
            tanam_mt_1: values.date_range_mt_1?.[0]?.format("YYYY-MM"),
            panen_mt_1: values.date_range_mt_1?.[1]?.format("YYYY-MM"),
            tanam_mt_2: values.date_range_mt_2?.[0]?.format("YYYY-MM"),
            panen_mt_2: values.date_range_mt_2?.[1]?.format("YYYY-MM"),
            tanam_mt_3: values.date_range_mt_3?.[0]?.format("YYYY-MM"),
            panen_mt_3: values.date_range_mt_3?.[1]?.format("YYYY-MM"),
        };
        
        // Remove the range picker fields from the payload
        delete formattedValues.date_range_mt_1;
        delete formattedValues.date_range_mt_2;
        delete formattedValues.date_range_mt_3;
        
        form?.resetFields();
        onSave(formattedValues);
        
    };

    const handleBack = () => {
        form.resetFields();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="absolute bottom-0 left-0 bg-white w-screen animate-slide-up"
            style={{ zIndex: 99999 }}
        >
            <div className="flex justify-between items-center px-4 pt-4">
                <div>
                    <h1 className="text-base font-semibold text-black">Histori Tanam</h1>
                    <h2 className="mt-1 text-xs text-gray-500">Data ini bersifat opsional</h2>
                </div>
                <button className="text-xs font-semibold text-black" onClick={handleBack}>
                    <X />
                </button>
            </div>

            <Form form={form} className="form-custom-margin" onFinish={handleFinish}>
                {[1, 2, 3].map((period) => (
                    <div key={period}>
                        <h2 className="text-sm mt-4 px-4 font-medium">
                            Periode {period} <span className="font-light text-gray-500">(Opsional)</span>
                        </h2>
                        <div className="mx-4 mt-2">
                            <Form.Item name={`commodity_mt_${period}`}>
                                <Select 
                                    allowClear 
                                    options={optionCommodity} 
                                    className="w-full p-3-f" 
                                    placeholder="Pilih komoditas"
                                />
                            </Form.Item>
                        </div>

                        <div className="mx-4 mt-2">
                            <Form.Item name={`date_range_mt_${period}`} className="w-full">
                                <RangePicker 
                                    key={`date_range_mt_${period}`}
                                    inputReadOnly 
                                    className="w-full p-3-f" 
                                    picker="month" 
                                    placeholder={['Waktu tanam', 'Waktu panen']}
                                    allowEmpty={[true, true]}
                                    autoFocus={false}
                                    size="small"
                                    format="MMM YYYY"
                                    dropdownClassName="mobile-range-picker"
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    panelRender={(panelNode) => (
                                        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                            {panelNode}
                                        </div>
                                    )}
                                />
                            </Form.Item>
                        </div>
                    </div>
                ))}

                <div className="mx-4 mt-5">
                    <button
                        type="submit"
                        className="w-full font-semibold text-white text-center text-sm py-2 rounded bg-blue"
                    >
                        Simpan Histori Tanam
                    </button>
                    <button
                        className="mb-3 mt-2 w-full font-semibold text-black text-center text-sm p-2 rounded border border-gray-400"
                        onClick={handleBack}
                    >
                        Kembali
                    </button>
                </div>
            </Form>
        </div>
    );
} 