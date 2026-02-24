import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL;

const JobList = ({ email }) => {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoUrls, setRepoUrls] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});

  useEffect(() => {
    // Add dark mode class if not already present, just in case
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [candidateRes, jobsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/candidate/get-by-email?email=${encodeURIComponent(email)}`),
          fetch(`${BASE_URL}/api/jobs/get-list`)
        ]);

        if (!candidateRes.ok) {
          throw new Error(`Failed to fetch candidate: ${candidateRes.statusText}`);
        }
        if (!jobsRes.ok) {
          throw new Error(`Failed to fetch jobs: ${jobsRes.statusText}`);
        }

        const candidateData = await candidateRes.json();
        const jobsData = await jobsRes.json();

        setCandidate(candidateData);
        setJobs(jobsData);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchData();
    }
  }, [email]);

  const handleUrlChange = (jobId, url) => {
    setRepoUrls({ ...repoUrls, [jobId]: url });
    // Clear any previous errors or success states when typing
    if (submitErrors[jobId] || submitSuccess[jobId]) {
      setSubmitErrors({ ...submitErrors, [jobId]: null });
      setSubmitSuccess({ ...submitSuccess, [jobId]: null });
    }
  };

  const handleApply = async (jobId) => {
    const repoUrl = repoUrls[jobId] || '';
    if (!repoUrl) {
      setSubmitErrors({ ...submitErrors, [jobId]: 'Please provide a GitHub repository URL' });
      return;
    }

    setSubmitting({ ...submitting, [jobId]: true });
    setSubmitErrors({ ...submitErrors, [jobId]: null });
    setSubmitSuccess({ ...submitSuccess, [jobId]: null });

    try {
      const response = await fetch(`${BASE_URL}/api/candidate/apply-to-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uuid: candidate.uuid,
          jobId: jobId,
          candidateId: candidate.candidateId,
          applicationId: candidate.applicationId,
          repoUrl: repoUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Application failed with status ${response.status}`);
      }

      await response.json(); // Consuming the response
      setSubmitSuccess({ ...submitSuccess, [jobId]: true });
    } catch (err) {
      setSubmitErrors({ ...submitErrors, [jobId]: err.message || 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting({ ...submitting, [jobId]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen max-w-md lg:max-w-5xl xl:max-w-6xl w-full mx-auto relative z-10 pt-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <section key={i} className="glass-card rounded-2xl p-6 opacity-60">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 shimmer"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 shimmer"></div>
                  <div className="h-3 bg-white/10 rounded-full w-1/2 shimmer"></div>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="h-12 bg-white/5 rounded-xl w-full shimmer"></div>
                <div className="h-12 bg-white/5 rounded-xl w-full shimmer"></div>
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen max-w-md lg:max-w-5xl xl:max-w-6xl w-full mx-auto relative z-10 pt-10 px-6">
        <section className="glass-card rounded-2xl p-6 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.1)] max-w-md mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <h3 className="text-lg font-bold text-red-100">Error Load Data</h3>
          </div>
          <p className="text-sm text-red-200 mt-2">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-md lg:max-w-5xl xl:max-w-6xl mx-auto relative z-10">
      <header className="flex items-center justify-between px-6 py-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
            <span className="material-symbols-outlined text-blue-500 text-2xl">account_circle</span>
          </div>
          <div>
            <h1 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Welcome back,
            </h1>
            <span className="text-xl font-bold tracking-tight">
              {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Candidate'}
            </span>
          </div>
        </div>
      </header>

      <h1 className="text-2xl font-bold tracking-tight px-6 mb-8">Open Positions</h1>

      <main className="flex-1 overflow-y-auto px-6 pb-12">
        {jobs.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No positions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const isSubmitting = submitting[job.id];
              const isSuccess = submitSuccess[job.id];
              const submitError = submitErrors[job.id];
              const urlValue = repoUrls[job.id] || '';

              return (
                <section
                  key={job.id}
                  className={`glass-card rounded-2xl p-6 flex flex-col gap-4 ${submitError ? 'border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.1)]' : 'shadow-xl'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center p-2 border border-white/10">
                        <span className="material-symbols-outlined text-slate-200 text-2xl">work</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mt-1 text-slate-100">{job.title}</h3>
                        <p className="text-xs text-slate-400">ID: {job.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block">
                      {submitError ? (
                        <div className="flex justify-between px-1">
                          <span className="text-xs font-semibold text-slate-300">GitHub Repository URL</span>
                          <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">error</span>
                            {submitError}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300 ml-1">GitHub Repository URL</span>
                      )}
                      <input
                        type="text"
                        className={`mt-2 block w-full rounded-xl px-4 py-3.5 text-sm transition-all outline-none 
                        ${submitError
                            ? 'bg-red-500/5 border-red-500/30 text-red-200 focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]'
                            : 'bg-slate-900/50 border-glass-border text-slate-200 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-slate-600'
                          }`}
                        placeholder="https://github.com/..."
                        value={urlValue}
                        onChange={(e) => handleUrlChange(job.id, e.target.value)}
                        disabled={isSubmitting || isSuccess}
                      />
                    </label>

                    {isSuccess ? (
                      <button disabled className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-green-500/20 text-green-400 border border-green-500/30 flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Application Submitted
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isSubmitting || !urlValue.trim()}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg 
                        ${isSubmitting || !urlValue.trim()
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20 text-white'
                          }`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default JobList;
