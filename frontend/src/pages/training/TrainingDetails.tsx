import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Trash2, Pencil, Check } from "lucide-react";
import { trainingService } from "../../services/trainingService";
import type { TrainingProgram } from "../../types/training";
import DeleteConfirmModal from "../DeleteConfirmModal";

const TrainingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      if (id) {
        const data = await trainingService.getById(id);
        setProgram(data || null);
      }
      setLoading(false);
    };
    fetchProgram();
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      await trainingService.delete(id);
      setIsModalOpen(false);
      navigate("/dashboard/trainings");
    }
  };

  if (loading)
    return <div className="p-20 text-center font-bold">Loading...</div>;

  if (!program) {
    return (
      <div className="flex-1 flex flex-col h-full items-center justify-center p-10">
        <div className="text-center">
          <AlertCircle size={64} className="text-slate-300 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-[#102359] mb-2">
            Program Not Found
          </h2>
          <p className="text-slate-500 mb-6">
            The training program you're looking for might have been moved.
          </p>
          <button
            onClick={() => navigate("..")}
            className="px-6 py-3 bg-[#3AE39E] text-[#081E67] rounded-xl font-bold"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <Link
                to=".."
                className="flex items-center gap-1 text-slate-400 hover:text-[#3AE39E] transition-colors text-xs font-bold uppercase tracking-widest mb-2"
              >
                <ArrowLeft size={14} /> Back to List
              </Link>
              <h1 className="text-3xl font-extrabold text-[#102359] tracking-tight">
                {program.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
              <Link
                to={`/dashboard/trainings/${id}/edit`}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3AE39E] rounded-xl text-[#081E67] text-sm font-bold hover:brightness-105 transition-all shadow-lg shadow-green-500/20"
              >
                <Pencil size={18} />
                <span>Edit Program</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                  <div
                    className="bg-cover bg-center w-full h-full"
                    style={{ backgroundImage: `url('${program.photo_url}')` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Price
                  </p>
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wide">
                    On Sale
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-extrabold text-[#3AE39E]">
                    रु{program.effective_price}
                  </span>
                  <span className="text-lg text-slate-400 line-through font-medium">
                    रु{program.base_price}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Instructors
                </p>
                <div className="flex flex-col gap-4">
                  {program.mentors.map((mentor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="size-11 rounded-full bg-cover bg-center border border-slate-200"
                        style={{
                          backgroundImage: `url('${mentor.photo_url}')`,
                        }}
                      ></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-700 truncate">
                          {mentor.name}
                        </span>
                        <span className="text-xs text-slate-400">Mentor</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full">
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    About the Program
                  </h3>
                  <div className="text-slate-600 leading-7">
                    <p>{program.description}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 mb-10 w-full"></div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Program Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {program.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="size-8 rounded-full bg-white shadow-sm border border-slate-100 text-[#3AE39E] flex items-center justify-center flex-shrink-0">
                          <Check size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">
                          {benefit}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        itemName={program.title}
      />
    </div>
  );
};

export default TrainingDetails;
