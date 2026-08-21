'use client';

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Check, Clock, Layers, ArrowRight } from 'lucide-react';

interface SuggestedExtra {
    name: string;
    category?: string;
    price: number;
    estimatedAdditionalHours?: number;
    isCrossService?: boolean;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    suggestedExtra?: SuggestedExtra | null;
}

export default function SelectExtras() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    // AI Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Find the service name from the store for context
    const [serviceName, setServiceName] = useState('');

    useEffect(() => {
        // Fetch the service name for context in the AI prompt
        if (data.serviceId) {
            fetch(`http://localhost:5001/api/services/${data.serviceId}`)
                .then(res => res.json())
                .then(service => setServiceName(service.name || ''))
                .catch(() => setServiceName(''));
        }
    }, [data.serviceId]);

    const handleToggle = (extraName: string, extraObj?: SuggestedExtra) => {
        const isSelected = data.extrasSelected.includes(extraName);

        if (isSelected) {
            updateData({
                extrasSelected: data.extrasSelected.filter((id) => id !== extraName),
            });
        } else {
            // If extraObj is provided and not already in aiExtras, ensure it's saved in aiExtras
            if (extraObj) {
                const alreadyInAi = data.aiExtras.some(e => e.name.toLowerCase() === extraObj.name.toLowerCase());
                const alreadyInStandard = data.serviceExtras.some(e => e.name.toLowerCase() === extraObj.name.toLowerCase());

                if (!alreadyInAi && !alreadyInStandard) {
                    updateData({
                        aiExtras: [...data.aiExtras, extraObj as { name: string; category?: string; price: number; estimatedAdditionalHours: number; isCrossService?: boolean }],
                        extrasSelected: [...data.extrasSelected, extraName],
                    });
                    return;
                }
            }

            updateData({
                extrasSelected: [...data.extrasSelected, extraName],
            });
        }
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/quote/suggest-extra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceName, userRequest: userMessage }),
            });

            const result = await res.json();

            // Store message with suggestedExtra payload
            setChatMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    content: result.message,
                    suggestedExtra: result.approved && result.extra ? result.extra : null
                }
            ]);

            // If approved, automatically register and select the add-on in the quote
            if (result.approved && result.extra) {
                const alreadyInAi = data.aiExtras.some(
                    (e) => e.name.toLowerCase() === result.extra.name.toLowerCase()
                );
                const alreadyInStandard = data.serviceExtras.some(
                    (e) => e.name.toLowerCase() === result.extra.name.toLowerCase()
                );

                const updatedAiExtras = (!alreadyInAi && !alreadyInStandard)
                    ? [...data.aiExtras, result.extra]
                    : data.aiExtras;

                const updatedSelected = data.extrasSelected.includes(result.extra.name)
                    ? data.extrasSelected
                    : [...data.extrasSelected, result.extra.name];

                updateData({
                    aiExtras: updatedAiExtras,
                    extrasSelected: updatedSelected,
                });
            }
        } catch {
            setChatMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    content: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
                }
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    const allExtras = [
        ...(data.serviceExtras || []),
        ...(data.aiExtras || []).map((e) => ({
            ...e,
            isAiSuggested: true,
            category: e.category || (e.isCrossService ? 'Cross-Service Add-on' : 'Custom Extra')
        }))
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Select Extras & Add-ons</h2>
                <p className="text-sm text-slate-500">
                    Add optional extras or request cross-service add-ons to bundle everything into this single quote.
                </p>
            </div>

            {/* Extras Grid */}
            <div className="mt-4">
                {allExtras.length === 0 ? (
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        No standard extras listed for this package. Use our AI assistant below to request custom or cross-service add-ons!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {allExtras.map((extra: { name: string; price: number; isAiSuggested?: boolean; category?: string; estimatedAdditionalHours?: number }) => {
                            const isSelected = data.extrasSelected.includes(extra.name);

                            return (
                                <div
                                    key={extra.name}
                                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                        ? 'border-[#d46b4e] bg-[#d46b4e]/5 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-[#d46b4e]/40 hover:bg-slate-50/50'
                                        }`}
                                    onClick={() => handleToggle(extra.name)}
                                >
                                    <Checkbox
                                        id={extra.name}
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggle(extra.name)}
                                        className="mr-3.5"
                                    />
                                    <div className="flex-1 min-w-0 pr-2">
                                        <label
                                            htmlFor={extra.name}
                                            className="text-slate-800 font-semibold text-sm cursor-pointer flex flex-wrap items-center gap-1.5"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <span className="truncate">{extra.name}</span>
                                        </label>

                                        {extra.isAiSuggested && (
                                            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md w-fit">
                                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                                <span>{extra.category || 'Bundled Add-on'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-[#d46b4e] font-bold text-sm">
                                            + R{extra.price}
                                        </div>
                                        {extra.estimatedAdditionalHours && (
                                            <div className="text-[10px] text-slate-400">
                                                ~{extra.estimatedAdditionalHours} hrs
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Assistant Section */}
            <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-[#d46b4e]/10 text-[#d46b4e] rounded-lg">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        Need something else or another service bundled?
                    </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Ask our AI assistant for any extra task (e.g. <em>&quot;Shine cutlery&quot;</em>, <em>&quot;Lawn mowing&quot;</em>, or <em>&quot;Burglar bars wiping&quot;</em>). Even if it belongs to a different department, we&apos;ll bundle it seamlessly into this same quote for you!
                </p>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                    <div className="mb-4 max-h-80 overflow-y-auto space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                        {chatMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm space-y-2.5 ${msg.role === 'user'
                                        ? 'bg-[#d46b4e] text-white rounded-br-xs'
                                        : 'bg-white border border-slate-200 text-slate-700 shadow-xs rounded-bl-xs'
                                        }`}
                                >
                                    <p className="leading-relaxed">{msg.content}</p>

                                    {/* Interactive Upsell / Add-on Card embedded in AI Chat */}
                                    {msg.suggestedExtra && (
                                        <div className="mt-2.5 p-3.5 bg-[#fafcf8] border border-[#86a373]/30 rounded-xl space-y-2.5 text-slate-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {msg.suggestedExtra.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                                        {msg.suggestedExtra.category && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#86a373]/15 text-[#42593b] font-semibold text-[10px]">
                                                                <Layers className="w-2.5 h-2.5" />
                                                                {msg.suggestedExtra.category}
                                                            </span>
                                                        )}
                                                        {msg.suggestedExtra.estimatedAdditionalHours && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                ~{msg.suggestedExtra.estimatedAdditionalHours} hrs
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-sm font-extrabold text-[#d46b4e]">
                                                        + R{msg.suggestedExtra.price}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-1">
                                                {data.extrasSelected.includes(msg.suggestedExtra.name) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(msg.suggestedExtra!.name, msg.suggestedExtra!)}
                                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>✓ Included in Your Quote (Click to remove)</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(msg.suggestedExtra!.name, msg.suggestedExtra!)}
                                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#d46b4e] hover:bg-[#b3573c] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>+ Add to this Quote (+R{msg.suggestedExtra.price})</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#d46b4e]" />
                                    <span>Evaluating service pricing & bundling options...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. Can you also shine my cutlery, or mow the front lawn?..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                        disabled={chatLoading}
                        className="flex-1 rounded-xl bg-white border-slate-200 text-sm focus-visible:ring-[#d46b4e]"
                    />
                    <Button
                        onClick={handleChatSubmit}
                        disabled={chatLoading || !chatInput.trim()}
                        className="bg-[#d46b4e] hover:bg-[#b3573c] text-white px-5 rounded-xl font-bold transition-all"
                    >
                        {chatLoading ? '...' : 'Ask AI'}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-8 flex justify-between items-center border-t border-slate-200">
                <Button variant="outline" onClick={prevStep} size="lg" className="rounded-xl">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    size="lg"
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white px-8 rounded-xl font-bold shadow-md shadow-[#d46b4e]/20 transition-all flex items-center gap-2"
                >
                    <span>Continue to Address</span>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
