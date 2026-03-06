'use client';

import { useQuoteStore } from '@/store/useQuoteStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PropertyDetails() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateData({
            property: {
                ...data.property,
                [name]: parseInt(value) || 0,
            },
        });
    };

    const handleConditionSelect = (level: 'standard' | 'deep' | 'heavy_duty') => {
        updateData({
            property: {
                ...data.property,
                conditionLevel: level,
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Details</h2>
                <p className="text-slate-500">Tell us a bit about the property.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sqm">Property Size (sqm)</Label>
                        <Input
                            id="sqm"
                            name="sqm"
                            type="number"
                            placeholder="e.g. 120"
                            value={data.property.sqm === 0 ? '' : data.property.sqm}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                            id="bedrooms"
                            name="bedrooms"
                            type="number"
                            placeholder="e.g. 3"
                            value={data.property.bedrooms === 0 ? '' : data.property.bedrooms}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                            id="bathrooms"
                            name="bathrooms"
                            type="number"
                            placeholder="e.g. 2"
                            value={data.property.bathrooms === 0 ? '' : data.property.bathrooms}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="block mb-2 text-slate-700">Condition Level</Label>
                    <div className="space-y-3">
                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.property.conditionLevel === 'standard' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                                }`}
                            onClick={() => handleConditionSelect('standard')}
                        >
                            <CardContent className="p-4">
                                <div className="font-semibold text-slate-800">Standard Clean</div>
                                <div className="text-sm text-slate-500">Regular maintenance cleaning</div>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.property.conditionLevel === 'deep' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                                }`}
                            onClick={() => handleConditionSelect('deep')}
                        >
                            <CardContent className="p-4">
                                <div className="font-semibold text-slate-800">Deep Clean</div>
                                <div className="text-sm text-slate-500">Thorough cleaning of all surfaces</div>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-sm ${data.property.conditionLevel === 'heavy_duty' ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
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
                    disabled={data.property.sqm === 0 && data.property.bedrooms === 0}
                    size="lg"
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
