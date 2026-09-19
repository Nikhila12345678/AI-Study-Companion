import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { pushToast } from '../store/uiSlice';
import { ListChecks, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

const DIFFICULTY_COLOR = { easy: 'bg-mastery-high/10 text-mastery-high', medium: 'bg-mastery-mid/10 text-mastery-mid', hard: 'bg-mastery-low/10 text-mastery-low' };

export default function Quiz() {
  const { projectId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [openAnswer, setOpenAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();

  const start = async () => {
    try {
      const res = await api.post(`/projects/${projectId}/quizzes`);
      setQuiz(res.data.quiz);
      setQuestion(res.data.question);
      setAssessment(null);
      setCount(1);
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    }
  };

  const submit = async () => {
    const answer = question.type === 'mcq' ? selectedOption : openAnswer;
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${quiz._id}/questions/${question._id}/answer`, { answer });
      setQuestion(res.data.question);
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    if (count >= 5) return finish();
    const res = await api.post(`/quizzes/${quiz._id}/questions/next`);
    setQuestion(res.data.question);
    setSelectedOption('');
    setOpenAnswer('');
    setCount((c) => c + 1);
  };

  const finish = async () => {
    const res = await api.post(`/quizzes/${quiz._id}/complete`);
    setAssessment(res.data.assessment);
    setQuestion(null);
  };

  if (assessment) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div className="w-14 h-14 rounded-full bg-mastery-high/10 text-mastery-high flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} />
        </div>
        <h2 className="font-display text-2xl text-ink mb-1">Quiz complete</h2>
        <p className="text-ink/60 mb-6">Overall score: {Math.round(assessment.overallScore * 100)}%</p>
        <div className="space-y-2 text-left mb-6">
          {assessment.conceptResults.map((c) => (
            <div key={c.conceptId} className="rounded-xl border border-brand-100 p-3 flex justify-between text-sm">
              <span>{c.conceptName}</span>
              <span className="text-ink/50">{c.correctCount}/{c.totalCount}</span>
            </div>
          ))}
        </div>
        <button onClick={start} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none">Take another quiz</button>
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center mx-auto mb-4">
          <ListChecks size={26} />
        </div>
        <h2 className="font-display text-xl text-ink mb-2">Ready for an adaptive quiz?</h2>
        <p className="text-sm text-ink/60 mb-6">Questions are chosen based on your current mastery — not just correct/wrong streaks.</p>
        <button onClick={start} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none">Start Quiz</button>
      </div>
    );
  }

  const answered = !!question.answeredAt;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-sm text-ink/50">
        <span>Question {count} of 5</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${DIFFICULTY_COLOR[question.difficulty]}`}>{question.difficulty}</span>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <p className="text-xs text-brand-500 font-medium mb-2">{question.conceptName}</p>
        <h3 className="font-display text-lg text-ink mb-4">{question.prompt}</h3>

        {question.type === 'mcq' ? (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = answered && question.correctAnswer === opt;
              const isWrongSelected = answered && isSelected && !question.isCorrect;
              return (
                <button key={opt} disabled={answered} onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    isCorrectAnswer ? 'border-mastery-high bg-mastery-high/10' :
                    isWrongSelected ? 'border-mastery-low bg-mastery-low/10' :
                    isSelected ? 'border-brand-500 bg-brand-50' : 'border-brand-100 hover:bg-brand-50'
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <textarea disabled={answered} value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)}
            placeholder="Explain in your own words…" className="textarea textarea-bordered w-full h-28" />
        )}

        {answered && (
          <div className={`mt-4 rounded-xl p-4 ${question.isCorrect ? 'bg-mastery-high/10' : 'bg-mastery-low/10'}`}>
            <div className="flex items-center gap-2 mb-1 text-sm font-medium">
              {question.isCorrect ? <CheckCircle2 size={16} className="text-mastery-high" /> : <XCircle size={16} className="text-mastery-low" />}
              {question.type === 'mcq' ? (question.isCorrect ? 'Correct' : 'Not quite') : `Score: ${Math.round((question.evaluation?.score || 0) * 100)}%`}
            </div>
            <p className="text-sm text-ink/70">{question.type === 'mcq' ? question.explanation : question.evaluation?.feedback}</p>
            {question.evaluation?.missing?.length > 0 && (
              <p className="text-xs text-ink/50 mt-1">Missing: {question.evaluation.missing.join(', ')}</p>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          {!answered ? (
            <button onClick={submit} disabled={submitting} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none">
              {submitting ? 'Checking…' : 'Submit answer'}
            </button>
          ) : (
            <button onClick={next} className="btn bg-brand-500 hover:bg-brand-600 text-white border-none gap-1.5">
              {count >= 5 ? 'Finish quiz' : 'Next question'} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
