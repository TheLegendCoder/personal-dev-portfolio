'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { aboutContent, experience, personalInfo, skills } from '@/components/data/content';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function OverviewContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p className="text-foreground">{aboutContent.intro}</p>
      <p className="text-muted-foreground">{aboutContent.story}</p>
      <p className="text-muted-foreground">{aboutContent.approach}</p>
    </div>
  );
}

export function AboutPanel() {
  const hasSkills = skills.length > 0;
  const hasExperience = experience.length > 0;
  const showTabs = hasSkills || hasExperience;

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[200px] shrink-0 flex-col gap-4 border-r border-border bg-muted/20 p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-[0_0_26px_-6px_hsl(var(--primary)/0.7)]">
          {initials(personalInfo.name)}
        </div>
        <div>
          <div className="font-semibold text-foreground">{personalInfo.name}</div>
          <div className="text-xs text-muted-foreground">{personalInfo.title}</div>
        </div>
        <div className="mt-auto flex items-center gap-2 font-mono text-[11px] text-green-600 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {personalInfo.availability}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-5">
        {showTabs ? (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {hasSkills && <TabsTrigger value="skills">Skills</TabsTrigger>}
              {hasExperience && <TabsTrigger value="experience">Experience</TabsTrigger>}
            </TabsList>
            <TabsContent value="overview">
              <OverviewContent />
            </TabsContent>
            {hasSkills && (
              <TabsContent value="skills">
                <div className="space-y-4">
                  {skills.map((group) => (
                    <div key={group.group}>
                      <div className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                        {group.group}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            {hasExperience && (
              <TabsContent value="experience">
                <div className="space-y-4">
                  {experience.map((item) => (
                    <div key={`${item.role}-${item.period}`} className="border-l-2 border-primary/40 pl-3">
                      <div className="font-mono text-xs text-primary">{item.period}</div>
                      <div className="font-semibold text-foreground">{item.role}</div>
                      <div className="text-xs text-muted-foreground">{item.company}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <OverviewContent />
        )}
      </div>
    </div>
  );
}
