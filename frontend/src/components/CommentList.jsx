import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getFriendlyError } from '../utils/errorMessage';

const PAGE_SIZE = 8;

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${name}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

const initials = (email) => email?.[0]?.toUpperCase() || '?';

// productId + sellerId are the only external inputs now — this component owns
// its own comment list and pagination state internally, which is what makes
// infinite scroll possible (the parent no longer needs to know page numbers).
const CommentList = ({ productId, sellerId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef(null);

  const isOwner = user && sellerId && user._id === sellerId;

  const loadPage = useCallback(
    async (nextPage) => {
      const res = await api.get(`/products/${productId}/comments`, {
        params: { page: nextPage, limit: PAGE_SIZE },
      });
      setComments((prev) => (nextPage === 1 ? res.data.comments : [...prev, ...res.data.comments]));
      setTotalPages(res.data.totalPages || 1);
      setPage(nextPage);
    },
    [productId]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchInitialPage = async () => {
      setInitialLoading(true);
      try {
        await loadPage(1);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    fetchInitialPage();
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  // Fetches the next page automatically once the sentinel div scrolls into view
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingMore) {
          setLoadingMore(true);
          loadPage(page + 1).finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, loadPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) return;
    try {
      const res = await api.post(`/products/${productId}/comments`, { content });
      setComments((prev) => [res.data.comment, ...prev]);
      setContent('');
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't post your comment."));
    }
  };

  const handleDelete = async (commentId) => {
    setError('');
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't delete that comment."));
    }
  };

  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setError('');
    try {
      const res = await api.put(`/comments/${commentId}`, { content: editContent });
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, content: res.data.comment.content } : c)));
      setEditingId(null);
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't save that edit."));
    }
  };

  return (
    <div>
      {!isOwner && user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-bold text-ink-secondary">
            {initials(user.email)}
          </div>
          <div className="flex flex-1 gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question or leave a comment…"
              className="input-modern"
            />
            <button type="submit" className="btn-primary shrink-0 px-5">Post</button>
          </div>
        </form>
      )}
      {isOwner && <p className="text-sm text-ink-secondary">You can't comment on your own listing.</p>}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">{error}</p>}

      <ul className="mt-6 space-y-5">
        {initialLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex animate-pulse gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-surface-strong" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-24 rounded bg-surface-strong" />
                <div className="h-3 w-2/3 rounded bg-surface-strong" />
              </div>
            </li>
          ))
        ) : comments.length === 0 ? (
          <li className="muted-panel px-5 py-8 text-center text-sm text-ink-secondary">
            No comments yet — be the first to ask something.
          </li>
        ) : (
          comments.map((c) => {
            const isCommentAuthor = user && c.userId?._id === user._id;
            return (
              <li key={c._id} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-bold text-ink-secondary">
                  {initials(c.userId?.email)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{c.userId?.email}</p>
                    <span className="shrink-0 text-[11px] text-ink-disabled">{timeAgo(c.createdAt)}</span>
                  </div>

                  {editingId === c._id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, c._id)} className="mt-2 flex gap-2">
                      <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="input-modern" />
                      <button type="submit" className="btn-primary shrink-0 px-4 text-xs">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-secondary shrink-0 px-4 text-xs">Cancel</button>
                    </form>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-ink-secondary">{c.content}</p>
                  )}

                  {isCommentAuthor && editingId !== c._id && (
                    <div className="mt-1 flex gap-3 text-xs font-semibold">
                      <button onClick={() => { setEditingId(c._id); setEditContent(c.content); }} className="text-ink-secondary hover:text-ink">Edit</button>
                      <button onClick={() => handleDelete(c._id)} className="text-error hover:text-error-dark">Delete</button>
                    </div>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      {!initialLoading && page < totalPages && (
        <div ref={sentinelRef} className="py-4 text-center text-xs text-ink-disabled">
          {loadingMore ? 'Loading more comments…' : ''}
        </div>
      )}
    </div>
  );
};

export default CommentList;
