import { describe, it, expect } from 'vitest';
import {
  TOPICS,
  normalizeTopic,
  normalizeTopics,
  slugifyTopic,
  topicFromSlug,
  allTopicSlugs,
} from '@/lib/taxonomy';

describe('normalizeTopic()', () => {
  it('matches canonical topics case-insensitively', () => {
    expect(normalizeTopic('Architecture')).toBe('Architecture');
    expect(normalizeTopic('architecture')).toBe('Architecture');
    expect(normalizeTopic('  SECURITY  ')).toBe('Security');
  });

  it('collapses aliases onto one canonical topic', () => {
    // The whole point: dotnet / .NET / ASP.NET Core must not become 3 pages.
    expect(normalizeTopic('dotnet')).toBe('.NET');
    expect(normalizeTopic('.NET')).toBe('.NET');
    expect(normalizeTopic('ASP.NET Core')).toBe('.NET');
    expect(normalizeTopic('Entity Framework')).toBe('.NET');

    expect(normalizeTopic('csharp')).toBe('C#');
    expect(normalizeTopic('C# Fundamentals')).toBe('C#');

    expect(normalizeTopic('Clean Architecture')).toBe('Architecture');
    expect(normalizeTopic('Distributed Systems')).toBe('Architecture');

    expect(normalizeTopic('JWT')).toBe('Security');
    expect(normalizeTopic('Authentication')).toBe('Security');

    expect(normalizeTopic('Azure')).toBe('Cloud');
  });

  it('returns null for tags that are not canonical topics', () => {
    // Normal and expected — most tags are legitimately not topics.
    expect(normalizeTopic('Building in Public')).toBeNull();
    expect(normalizeTopic('CIDIS Model')).toBeNull();
    expect(normalizeTopic('')).toBeNull();
    expect(normalizeTopic('   ')).toBeNull();
  });
});

describe('normalizeTopics()', () => {
  it('de-duplicates aliases that map to the same topic', () => {
    expect(normalizeTopics(['dotnet', '.NET', 'ASP.NET Core'])).toEqual(['.NET']);
  });

  it('returns topics in TOPICS order regardless of tag order', () => {
    expect(normalizeTopics(['Testing', 'C#', 'Cloud'])).toEqual([
      'C#',
      'Cloud',
      'Testing',
    ]);
    expect(normalizeTopics(['Cloud', 'Testing', 'C#'])).toEqual([
      'C#',
      'Cloud',
      'Testing',
    ]);
  });

  it('drops non-topic tags', () => {
    expect(normalizeTopics(['Building in Public', 'JWT'])).toEqual(['Security']);
  });

  it('returns an empty array for no tags', () => {
    expect(normalizeTopics([])).toEqual([]);
  });
});

describe('slugifyTopic()', () => {
  it('produces readable, URL-safe slugs for the awkward names', () => {
    expect(slugifyTopic('C#')).toBe('c-sharp');
    expect(slugifyTopic('.NET')).toBe('dotnet');
  });

  it('lowercases the straightforward ones', () => {
    expect(slugifyTopic('Architecture')).toBe('architecture');
    expect(slugifyTopic('AI')).toBe('ai');
  });

  it('never emits leading or trailing hyphens', () => {
    TOPICS.forEach((topic) => {
      const slug = slugifyTopic(topic);
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });

  it('produces a unique slug per topic', () => {
    const slugs = TOPICS.map(slugifyTopic);
    expect(new Set(slugs).size).toBe(TOPICS.length);
  });
});

describe('topicFromSlug()', () => {
  it('round-trips every canonical topic', () => {
    TOPICS.forEach((topic) => {
      expect(topicFromSlug(slugifyTopic(topic))).toBe(topic);
    });
  });

  it('is case-insensitive', () => {
    expect(topicFromSlug('C-SHARP')).toBe('C#');
  });

  it('returns null for an unknown slug', () => {
    // Topic pages 404 on these rather than minting an empty indexable page.
    expect(topicFromSlug('quantum-computing')).toBeNull();
    expect(topicFromSlug('')).toBeNull();
  });
});

describe('allTopicSlugs()', () => {
  it('covers every topic exactly once', () => {
    const all = allTopicSlugs();
    expect(all).toHaveLength(TOPICS.length);
    expect(all.map((entry) => entry.topic)).toEqual([...TOPICS]);
  });
});
