'use client';

import { useQuoteStore } from '@/store/useQuoteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddressInput() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateData({
            address: {
                ...data.address,
                [name]: value,
            },
        });
    };

    const isComplete =
        data.address.line1.trim() !== '' &&
        data.address.city.trim() !== '' &&
        data.address.province.trim() !== '' &&
        data.address.postalCode.trim() !== '';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Address</h2>
                <p className="text-slate-500">Where should we go to perform the cleaning?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="line1">Street Address</Label>
                    <Input
                        id="line1"
                        name="line1"
                        placeholder="123 Main St"
                        value={data.address.line1}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb (Optional)</Label>
                    <Input
                        id="suburb"
                        name="suburb"
                        placeholder="Sandton"
                        value={data.address.suburb}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        name="city"
                        placeholder="Johannesburg"
                        value={data.address.city}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                        id="province"
                        name="province"
                        placeholder="Gauteng"
                        value={data.address.province}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="2196"
                        value={data.address.postalCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="pt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={!isComplete}
                    size="lg"
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
