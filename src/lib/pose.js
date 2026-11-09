// Tiny shared store for what the avatar is doing.
// Chapters set a base pose; a focused project can override it while it is on screen.
const state = { chapter: 'hello', project: null, talking: false };
const subs = new Set();
const emit = () => subs.forEach((f) => f(current()));

export const current = () => ({ pose: state.project || state.chapter, talking: state.talking });
export const subscribe = (f) => { subs.add(f); f(current()); return () => subs.delete(f); };

export function setChapterPose(p) {
  if (state.chapter === p) return;
  state.chapter = p;
  emit();
}
export function setProjectPose(p) {
  if (state.project === p) return;
  state.project = p;
  emit();
}
export function setTalking(t) {
  if (state.talking === t) return;
  state.talking = t;
  emit();
}
