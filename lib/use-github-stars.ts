'use client';

import { useEffect, useState } from 'react';

export function useGithubStars(repo: string): string {
  const [stars, setStars] = useState<string>('★');

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then(r => r.json())
      .then(d => {
        const n = d?.stargazers_count;
        if (typeof n === 'number') {
          setStars(n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n));
        }
      })
      .catch(() => {}); // silently fail — shows ★ fallback
  }, [repo]);

  return stars;
}
