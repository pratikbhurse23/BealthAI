import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History as HistoryIcon, Search, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import BottomSheetSelect from "../components/BottomSheetSelect";
import HistoryCard from "../components/food/HistoryCard";
import AnalysisResult from "../components/food/AnalysisResult";
import { analysesStore } from "../components/localStore";
import PullToRefresh from "../components/PullToRefresh";

export default function History() {
    const [analyses, setAnalyses] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        setAnalyses(analysesStore.list());
    }, []);

    const filtered = analyses.filter((a) => {
        const matchSearch = !search || a.food_name?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === "all" || a.food_category === categoryFilter;
        return matchSearch && matchCategory;
    });

    return (
        <PullToRefresh onRefresh={() => setAnalyses(analysesStore.list())}>
            <div className="min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <HistoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search foods..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl border-gray-200"
                            />
                        </div>
                        <BottomSheetSelect
                            title="Filter by Category"
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                            triggerClassName="w-40 rounded-xl border-gray-200"
                            options={[
                                { value: "all", label: "All" },
                                { value: "healthy", label: "Healthy" },
                                { value: "moderate", label: "Moderate" },
                                { value: "unhealthy", label: "Unhealthy" },
                            ]}
                        />
                    </div>

                    <AnimatePresence>
                        {selected && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                                <div className="flex justify-end mb-2">
                                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                                        <X className="w-4 h-4 mr-1" /> Close Details
                                    </Button>
                                </div>
                                <AnalysisResult analysis={selected} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-lg">No scans found</p>
                            <p className="text-gray-300 text-sm mt-1">Upload a food photo to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((item) => (
                                <HistoryCard key={item.id} item={item} onClick={() => setSelected(item)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PullToRefresh>
    );
}
