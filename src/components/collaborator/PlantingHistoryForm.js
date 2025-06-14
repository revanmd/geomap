import { Form, Select, DatePicker } from "antd";
import { Minus, X } from "lucide-react";
import { useEffect } from "react";
import dayjs from "dayjs";

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
        if (initialData) {
            const formattedData = {
                ...initialData,
                commodity_mt_1: initialData?.commodity_mt_1 || undefined,
                commodity_mt_2: initialData?.commodity_mt_2 || undefined,
                commodity_mt_3: initialData?.commodity_mt_3 || undefined,
                panen_mt_1: initialData?.panen_mt_1 ? dayjs(initialData.panen_mt_1, 'YYYY-MM') : undefined,
                panen_mt_2: initialData?.panen_mt_2 ? dayjs(initialData.panen_mt_2, 'YYYY-MM') : undefined,
                panen_mt_3: initialData?.panen_mt_3 ? dayjs(initialData.panen_mt_3, 'YYYY-MM') : undefined,
                tanam_mt_1: initialData?.tanam_mt_1 ? dayjs(initialData.tanam_mt_1, 'YYYY-MM') : undefined,
                tanam_mt_2: initialData?.tanam_mt_2 ? dayjs(initialData.tanam_mt_2, 'YYYY-MM') : undefined,
                tanam_mt_3: initialData?.tanam_mt_3 ? dayjs(initialData.tanam_mt_3, 'YYYY-MM') : undefined,
            };
            form.setFieldsValue(formattedData);
        }else{
            form.resetFields();
        }
    }, [initialData, form]);

    const handleFinish = () => {
        const values = form.getFieldsValue();
        const formattedValues = {
            ...values,
            panen_mt_1: values.panen_mt_1?.format("YYYY-MM"),
            panen_mt_2: values.panen_mt_2?.format("YYYY-MM"),
            panen_mt_3: values.panen_mt_3?.format("YYYY-MM"),
            tanam_mt_1: values.tanam_mt_1?.format("YYYY-MM"),
            tanam_mt_2: values.tanam_mt_2?.format("YYYY-MM"),
            tanam_mt_3: values.tanam_mt_3?.format("YYYY-MM"),
        };
        form.resetFields();
        onSave(formattedValues);
        
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
                <button className="text-xs font-semibold text-black" onClick={onClose}>
                    <X />
                </button>
            </div>

            <Form form={form} className="form-custom-margin">
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
                            <div className="flex items-center space-x-2 w-full">
                                <Form.Item name={`tanam_mt_${period}`} className="w-full">
                                    <DatePicker 
                                        inputReadOnly 
                                        className="w-full p-3-f" 
                                        picker="month" 
                                        placeholder="Waktu tanam" 
                                    />
                                </Form.Item>
                                <span className="text-gray-300"><Minus /></span>
                                <Form.Item name={`panen_mt_${period}`} className="w-full">
                                    <DatePicker 
                                        inputReadOnly 
                                        className="w-full p-3-f" 
                                        picker="month" 
                                        placeholder="Waktu panen" 
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="mx-4 mt-5">
                    <button
                        className="w-full font-semibold text-white text-center text-sm py-2 rounded bg-blue"
                        onClick={handleFinish}
                    >
                        Simpan Histori Tanam
                    </button>
                    <button
                        className="mb-3 mt-2 w-full font-semibold text-black text-center text-sm p-2 rounded border border-gray-400"
                        onClick={onClose}
                    >
                        Kembali
                    </button>
                </div>
            </Form>
        </div>
    );
} 