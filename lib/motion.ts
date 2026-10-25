type RevealTarget = {
  getAnimations(): { cancel(): void }[];
  animate(frames: Keyframe[], options: KeyframeAnimationOptions): unknown;
};

export function revealMonster(target: RevealTarget | null, reducedMotion: boolean) {
  if (!target) return;
  target.getAnimations().forEach(animation => animation.cancel());
  if (reducedMotion) return;
  target.animate([
    { transform: 'translateY(0) rotate(0)' },
    { transform: 'translateY(-9px) rotate(-3deg)', offset: .35 },
    { transform: 'translateY(2px) rotate(2deg)', offset: .7 },
    { transform: 'translateY(0) rotate(0)' },
  ], { duration: 320, easing: 'ease-out' });
}
