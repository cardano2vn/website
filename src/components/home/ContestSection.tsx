"use client";

import React from "react";
import ContestForm from "~/components/home/ContestForm";
import ContestTable from "~/components/home/ContestTable";
import ContestQuestions from "~/components/home/ContestQuestions";

export default function ContestSection() {
  const [showQuestions, setShowQuestions] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        <div className={`md:order-1 order-2 w-full ${showQuestions ? 'md:col-span-3' : 'md:col-span-1'}`}>
          {showQuestions ? (
            <ContestQuestions onBack={() => { setShowQuestions(false); setEmail(null); }} />
          ) : (
            <ContestForm onStart={(em) => { setEmail(em); setShowQuestions(true); }} />
          )}
        </div>
        {!showQuestions && (
          <div className="md:order-2 order-1 w-full md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
              <div className="p-4 sm:p-5 w-full">
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white text-center">BẢNG XẾP HẠNG</h3>
                <ContestTable />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


