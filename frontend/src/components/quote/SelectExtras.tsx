'use client';

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

// Unused interface removed

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

            setChatMessages(prev => [...prev, { role: 'ai', content: result.message }]);

            if (result.approved && result.extra) {
                const alreadyExists =
                    data.serviceExtras.some(e => e.name.toLowerCase() === result.extra.name.toLowerCase()) ||
                    data.aiExtras.some((e: { name: string }) => e.name.toLowerCase() === result.extra.name.toLowerCase());

                if (!alreadyExists) {
                    updateData({ aiExtras: [...data.aiExtras, result.extra] });
                }
            }
        } catch {
            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: 'Sorry, I\'m having trouble connecting right now. Please try again.'
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const allExtras = [
        ...(data.serviceExtras || []),
        ...(data.aiExtras || []).map((e: { name: string, price: number }) => ({ ...e, isAiSuggested: true }))
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Extras</h2>
                <p className="text-slate-500">Add any optional extras to your service.</p>
            </div>

            {/* Extras Grid */}
            <div className="mt-6">
                {allExtras.length === 0 ? (
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                        No optional extras available yet. Use the chatbot below to request one!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allExtras.map((extra: { name: string, price: number, isAiSuggested?: boolean }) => (
                            <div
                                key={extra.name}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${data.extrasSelected.includes(extra.name)
                                    ? 'border-[#d46b4e] bg-[#d46b4e]/10'
                                    : 'border-slate-200 hover:border-[#d46b4e]/50'
                                    }`}
                                onClick={() => handleToggle(extra.name)}
                            >
                                <Checkbox
                                    id={extra.name}
                                    checked={data.extrasSelected.includes(extra.name)}
                                    onCheckedChange={() => handleToggle(extra.name)}
                                    className="mr-4"
                                />
                                <div className="flex-1">
                                    <label
                                        htmlFor={extra.name}
                                        className="text-slate-800 font-medium cursor-pointer flex items-center gap-2"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {extra.isAiSuggested && (
                                            <span className="text-amber-500 text-sm" title="AI Suggested">✨</span>
                                        )}
                                        {extra.name}
                                    </label>
                                </div>
                                <div className="text-[#d46b4e] font-semibold mb-0">
                                    + R{extra.price}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Chatbot Section */}
            <div className="mt-8 border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">✨</span>
                    <h3 className="text-lg font-semibold text-slate-800">Need something else?</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    Tell our AI assistant what you need and we&apos;ll check if it&apos;s available for your <span className="font-medium text-slate-700">{serviceName || 'selected service'}</span>.
                </p>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                    <div className="mb-4 max-h-60 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        {chatMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user'
                                        ? 'bg-[#d46b4e] text-white'
                                        : 'bg-white border border-slate-200 text-slate-700'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-400">
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. I also need hedge trimming..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                        disabled={chatLoading}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleChatSubmit}
                        disabled={chatLoading || !chatInput.trim()}
                        className="bg-[#d46b4e] hover:bg-[#b3573c] text-white px-6"
                    >
                        {chatLoading ? '...' : 'Ask'}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-8 flex justify-between">
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
