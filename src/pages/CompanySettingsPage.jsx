import React from 'react';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function CompanySettingsPage() {

    const navigate = useNavigate();

    const handleSave = () => toast.success('Settings saved!');

    return (
        <div
            className="max-w-3xl mx-auto mt-8 p-8 rounded-3xl shadow-lg
        bg-white dark:bg-indigo-500/5 dark:backdrop-blur-lg dark:shadow-md dark:ring-1 dark:ring-white/20"
        >
            <div className="flex items-center justify-between mb-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline"
                >
                    <HiOutlineArrowLeft className="text-xl" />
                    Back
                </button>

                <h2 className="text-3xl font-semibold text-indigo-700 dark:text-indigo-100 mb-6">
                    Company Settings
                </h2>

                <div className="w-12" />
            </div>

            <form className="space-y-5">
                <div>
                    <label className="block mb-1 font-medium text-gray-800 dark:text-indigo-100">
                        Company Name
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded border border-gray-300 text-gray-800
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-800 dark:text-indigo-100">
                        Industry
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded border border-gray-300 text-gray-800
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-800 dark:text-indigo-100">
                        Company Logo
                    </label>
                    <input
                        type="file"
                        className="w-full px-4 py-2 rounded border border-gray-300 text-gray-800
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-800 dark:text-indigo-100">
                        Policies / FAQs
                    </label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-2 rounded border border-gray-300 text-gray-800
              dark:bg-indigo-500/10 dark:border-indigo-300 dark:text-indigo-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition
            dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                    Save Settings
                </button>
            </form>
        </div>
    );
}
