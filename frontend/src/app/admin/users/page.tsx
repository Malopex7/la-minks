"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminStore, User } from "@/store/adminStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Shield,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    Key,
    Phone,
    Mail
} from "lucide-react";

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
    superadmin: {
        label: "Super Admin",
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
    },
    admin: {
        label: "Admin",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
    },
    staff: {
        label: "Staff",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
    },
    customer: {
        label: "Customer",
        bg: "bg-zinc-100 dark:bg-zinc-800",
        text: "text-zinc-700 dark:text-zinc-300",
        border: "border-zinc-200 dark:border-zinc-700",
    },
};

export default function UserManagementPage() {
    const { users, fetchUsers, createUser, updateUser, deleteUser, isLoading, error: storeError } = useAdminStore();
    const { user: currentUser } = useAuthStore();

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "customer",
        password: "",
        isEmailVerified: true,
    });

    const loadUsers = useCallback(() => {
        fetchUsers({ role: roleFilter || undefined, search: search || undefined });
    }, [fetchUsers, roleFilter, search]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "customer",
            password: "",
            isEmailVerified: true,
        });
        setFormError("");
        setModalOpen(true);
    };

    const openEditModal = (targetUser: User) => {
        setEditingUser(targetUser);
        setFormData({
            firstName: targetUser.firstName || "",
            lastName: targetUser.lastName || "",
            email: targetUser.email || "",
            phone: targetUser.phone || "",
            role: targetUser.role || "customer",
            password: "", // empty means keep existing
            isEmailVerified: targetUser.isEmailVerified !== undefined ? targetUser.isEmailVerified : true,
        });
        setFormError("");
        setModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setActionLoading(true);

        try {
            if (editingUser) {
                const payload: Record<string, unknown> = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    isEmailVerified: formData.isEmailVerified,
                };
                if (formData.password.trim()) {
                    payload.password = formData.password.trim();
                }
                await updateUser(editingUser._id, payload);
            } else {
                if (!formData.password) {
                    throw new Error("Password is required for new users");
                }
                await createUser(formData);
            }
            setModalOpen(false);
            loadUsers();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        setActionLoading(true);
        try {
            await deleteUser(id);
            setDeleteConfirmId(null);
            loadUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete user");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#d46b4e]" />
                        User Management
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Create, inspect, update roles, and manage all accounts across the platform.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 bg-[#d46b4e] hover:bg-[#b3573c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Create New User
                </button>
            </div>

            {/* Error banner */}
            {storeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {storeError}
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                    >
                        <option value="">All Roles</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>

                {(search || roleFilter) && (
                    <button
                        onClick={() => { setSearch(""); setRoleFilter(""); }}
                        className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
                    >
                        Clear Filters
                    </button>
                )}

                <span className="ml-auto text-xs font-medium text-zinc-400">
                    {users.length} {users.length === 1 ? "user" : "users"}
                </span>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                {isLoading && !users.length ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#d46b4e]" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Phone</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((targetUser) => {
                                        const badge = ROLE_BADGES[targetUser.role] || ROLE_BADGES.customer;
                                        const isSelf = currentUser?._id === targetUser._id;

                                        return (
                                            <tr
                                                key={targetUser._id}
                                                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#86a373]/15 text-[#5c7a4d] flex items-center justify-center font-bold text-sm shrink-0">
                                                            {targetUser.firstName?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                                {targetUser.firstName} {targetUser.lastName}
                                                                {isSelf && (
                                                                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-normal">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3 text-zinc-400" />
                                                                {targetUser.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                                                    >
                                                        {targetUser.role === "superadmin" && <Shield className="w-3 h-3" />}
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-xs">
                                                    {targetUser.phone ? (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-zinc-400" />
                                                            {targetUser.phone}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-400">—</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {targetUser.isEmailVerified ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Unverified
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(targetUser)}
                                                            className="p-1.5 text-zinc-500 hover:text-[#d46b4e] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                            title="Edit user"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>

                                                        {!isSelf && (
                                                            <button
                                                                onClick={() => setDeleteConfirmId(targetUser._id)}
                                                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {editingUser ? "Edit User Account" : "Create New User"}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {editingUser ? `Updating ${editingUser.email}` : "Add a new staff, admin, or customer account"}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Assign Role *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="082 123 4567"
                                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                    <span className="flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5" />
                                        {editingUser ? "Change Password (optional)" : "Password *"}
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    placeholder={editingUser ? "Leave blank to keep existing password" : "Enter initial password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isEmailVerified}
                                        onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                                        className="w-4 h-4 text-[#d46b4e] rounded border-zinc-300 focus:ring-[#86a373]"
                                    />
                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        Email Verified (Allow immediate login without verification link)
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 bg-[#d46b4e] hover:bg-[#b3573c] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingUser ? "Save Changes" : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Confirm Account Deletion</h3>
                        <p className="text-xs text-zinc-500">
                            Are you sure you want to permanently remove this user? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(deleteConfirmId)}
                                disabled={actionLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? "Deleting…" : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
