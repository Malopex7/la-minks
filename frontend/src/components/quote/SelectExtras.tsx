'use client';

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

// Mock extras since we don't have full backend population
const AVAILABLE_EXTRAS = [
    { id: 'inside_fridge', name: 'Inside Fridge', price: 150 },
    { id: 'inside_oven', name: 'Inside Oven', price: 150 },
    { id: 'inside_cabinets', name: 'Inside Cabinets', price: 200 },
    { id: 'interior_windows', name: 'Interior Windows', price: 250 },
    { id: 'wall_washing', name: 'Wall Washing', price: 300 },
];

export default function SelectExtras() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const handleToggle = (extraId: string) => {
        const isSelected = data.extrasSelected.includes(extraId);

        if (isSelected) {
            updateData({
                extrasSelected: data.extrasSelected.filter((id) => id !== extraId),
            });
        } else {
            updateData({
                extrasSelected: [...data.extrasSelected, extraId],
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Extras</h2>
                <p className="text-slate-500">Add any optional extras to your cleaning service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {AVAILABLE_EXTRAS.map((extra) => (
                    <div
                        key={extra.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${data.extrasSelected.includes(extra.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300'
                            }`}
                        onClick={() => handleToggle(extra.id)}
                    >
                        <Checkbox
                            id={extra.id}
                            checked={data.extrasSelected.includes(extra.id)}
                            onCheckedChange={() => handleToggle(extra.id)}
                            className="mr-4"
                        />
                        <div className="flex-1">
                            <label
                                htmlFor={extra.id}
                                className="text-slate-800 font-medium cursor-pointer"
                                onClick={(e) => e.preventDefault()} // Let parent div handle click
                            >
                                {extra.name}
                            </label>
                        </div>
                        <div className="text-blue-600 font-semibold mb-0">
                            + R{extra.price}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
