'use client';

import { useQuoteStore } from '@/store/useQuoteStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ServiceDetails() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        // Handle numbers and booleans intelligently
        let parsedValue: string | number | boolean = value;
        if (type === 'number') {
            parsedValue = parseInt(value) || 0;
        } else if (type === 'checkbox') {
            parsedValue = checked;
        }

        updateData({
            serviceDetails: {
                ...data.serviceDetails,
                [name]: parsedValue,
            },
        });
    };

    const handleConditionSelect = (level: 'standard' | 'deep' | 'heavy_duty') => {
        updateData({
            serviceDetails: {
                ...data.serviceDetails,
                conditionLevel: level,
            },
        });
    };

    // If a service has no specific inputs configured, we just default to asking for condition level
    const hasDynamicInputs = data.serviceInputs && data.serviceInputs.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Details</h2>
                <p className="text-slate-500">Tell us a bit more about what needs cleaning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {hasDynamicInputs ? (
                        data.serviceInputs.map((inputSchema) => (
                            <div key={inputSchema.name} className="space-y-2">
                                <Label htmlFor={inputSchema.name}>{inputSchema.label}</Label>
                                {inputSchema.type === 'number' && (
                                    <Input
                                        id={inputSchema.name}
                                        name={inputSchema.name}
                                        type="number"
                                        placeholder={`e.g. 3`}
                                        value={String(data.serviceDetails[inputSchema.name] ?? '')}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                )}
                                {/* You could add <select> for 'select' types or Switch/Checkbox for 'boolean' types here in the future! */}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                            No specific dimensions required for this service.
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Label className="block mb-2 text-slate-700">Condition Level</Label>
                    <div className="space-y-3">
                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.serviceDetails.conditionLevel === 'standard' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                                }`}
                            onClick={() => handleConditionSelect('standard')}
                        >
                            <CardContent className="p-4">
                                <div className="font-semibold text-slate-800">Standard Clean</div>
                                <div className="text-sm text-slate-500">Regular maintenance cleaning</div>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.serviceDetails.conditionLevel === 'deep' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                                }`}
                            onClick={() => handleConditionSelect('deep')}
                        >
                            <CardContent className="p-4">
                                <div className="font-semibold text-slate-800">Deep Clean</div>
                                <div className="text-sm text-slate-500">Thorough cleaning of all surfaces</div>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.serviceDetails.conditionLevel === 'heavy_duty' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                                }`}
                            onClick={() => handleConditionSelect('heavy_duty')}
                        >
                            <CardContent className="p-4">
                                <div className="font-semibold text-slate-800">Heavy Duty</div>
                                <div className="text-sm text-slate-500">Post-construction or extremely soiled</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    size="lg"
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
