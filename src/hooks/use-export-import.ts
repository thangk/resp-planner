'use client';

import { useCallback } from 'react';
import { useChildrenStore } from '@/stores/children-store';
import { usePlansStore } from '@/stores/plans-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useIncomeStore } from '@/stores/income-store';
import { useSettingsStore } from '@/stores/settings-store';
import { APP_CONFIG } from '@/lib/constants';
import type { ExportData } from '@/types';

export function useExportImport() {
  const { children, setChildren, clearChildren } = useChildrenStore();
  const {
    plans,
    planChildren,
    contributions,
    clbOverrides,
    setPlans,
    setPlanChildren,
    setContributions,
    setCLBOverrides,
    clearPlans,
  } = usePlansStore();
  const { etfs, setETFs, clearETFs } = usePortfolioStore();
  const { incomeYears, setIncomeYears, clearIncomeYears } = useIncomeStore();
  const { theme, hasCompletedWizard, setTheme, setHasCompletedWizard } = useSettingsStore();

  // Generate export data
  const generateExportData = useCallback((): ExportData => {
    return {
      version: APP_CONFIG.version,
      exportedAt: new Date().toISOString(),
      children,
      etfs,
      plans,
      planChildren,
      contributions,
      clbOverrides,
      incomeYears,
      settings: {
        theme,
        hasCompletedWizard,
        lastOpenedPlanId: null,
      },
    };
  }, [
    children,
    etfs,
    plans,
    planChildren,
    contributions,
    clbOverrides,
    incomeYears,
    theme,
    hasCompletedWizard,
  ]);

  // Export to JSON file
  const exportToFile = useCallback(() => {
    const data = generateExportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const filename = `resp-planner-backup-${date}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return filename;
  }, [generateExportData]);

  // Validate import data structure
  const validateImportData = useCallback((data: unknown): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Invalid data format'] };
    }

    const exportData = data as Partial<ExportData>;

    // Check required fields
    if (!exportData.version) {
      errors.push('Missing version field');
    }

    if (!Array.isArray(exportData.children)) {
      errors.push('Missing or invalid children array');
    }

    if (!Array.isArray(exportData.etfs)) {
      errors.push('Missing or invalid etfs array');
    }

    if (!Array.isArray(exportData.plans)) {
      errors.push('Missing or invalid plans array');
    }

    if (!Array.isArray(exportData.planChildren)) {
      errors.push('Missing or invalid planChildren array');
    }

    if (!Array.isArray(exportData.contributions)) {
      errors.push('Missing or invalid contributions array');
    }

    if (!Array.isArray(exportData.incomeYears)) {
      errors.push('Missing or invalid incomeYears array');
    }

    return { valid: errors.length === 0, errors };
  }, []);

  // Import from JSON data
  const importData = useCallback(
    (data: ExportData, mode: 'replace' | 'merge' = 'replace') => {
      if (mode === 'replace') {
        // Clear all existing data first
        clearChildren();
        clearPlans();
        clearETFs();
        clearIncomeYears();
      }

      // Import children
      if (data.children && data.children.length > 0) {
        if (mode === 'replace') {
          setChildren(data.children);
        } else {
          // Merge: add only new children (by id)
          const existingIds = new Set(children.map((c) => c.id));
          const newChildren = data.children.filter((c) => !existingIds.has(c.id));
          setChildren([...children, ...newChildren]);
        }
      }

      // Import ETFs
      if (data.etfs && data.etfs.length > 0) {
        if (mode === 'replace') {
          setETFs(data.etfs);
        } else {
          const existingIds = new Set(etfs.map((e) => e.id));
          const newETFs = data.etfs.filter((e) => !existingIds.has(e.id));
          setETFs([...etfs, ...newETFs]);
        }
      }

      // Import plans
      if (data.plans && data.plans.length > 0) {
        if (mode === 'replace') {
          setPlans(data.plans);
        } else {
          const existingIds = new Set(plans.map((p) => p.id));
          const newPlans = data.plans.filter((p) => !existingIds.has(p.id));
          setPlans([...plans, ...newPlans]);
        }
      }

      // Import plan children
      if (data.planChildren && data.planChildren.length > 0) {
        if (mode === 'replace') {
          setPlanChildren(data.planChildren);
        } else {
          const existingKeys = new Set(planChildren.map((pc) => `${pc.planId}-${pc.childId}`));
          const newPlanChildren = data.planChildren.filter(
            (pc) => !existingKeys.has(`${pc.planId}-${pc.childId}`)
          );
          setPlanChildren([...planChildren, ...newPlanChildren]);
        }
      }

      // Import contributions
      if (data.contributions && data.contributions.length > 0) {
        if (mode === 'replace') {
          setContributions(data.contributions);
        } else {
          const existingIds = new Set(contributions.map((c) => c.id));
          const newContributions = data.contributions.filter((c) => !existingIds.has(c.id));
          setContributions([...contributions, ...newContributions]);
        }
      }

      // Import CLB overrides
      if (data.clbOverrides && data.clbOverrides.length > 0) {
        if (mode === 'replace') {
          setCLBOverrides(data.clbOverrides);
        } else {
          const existingIds = new Set(clbOverrides.map((c) => c.id));
          const newCLBOverrides = data.clbOverrides.filter((c) => !existingIds.has(c.id));
          setCLBOverrides([...clbOverrides, ...newCLBOverrides]);
        }
      }

      // Import income years
      if (data.incomeYears && data.incomeYears.length > 0) {
        if (mode === 'replace') {
          setIncomeYears(data.incomeYears);
        } else {
          const existingYears = new Set(incomeYears.map((i) => i.year));
          const newIncomeYears = data.incomeYears.filter((i) => !existingYears.has(i.year));
          setIncomeYears([...incomeYears, ...newIncomeYears]);
        }
      }

      // Import settings (always replace)
      if (data.settings) {
        if (data.settings.theme) {
          setTheme(data.settings.theme);
        }
        if (typeof data.settings.hasCompletedWizard === 'boolean') {
          setHasCompletedWizard(data.settings.hasCompletedWizard);
        }
      }
    },
    [
      children,
      etfs,
      plans,
      planChildren,
      contributions,
      clbOverrides,
      incomeYears,
      setChildren,
      setETFs,
      setPlans,
      setPlanChildren,
      setContributions,
      setCLBOverrides,
      setIncomeYears,
      clearChildren,
      clearETFs,
      clearPlans,
      clearIncomeYears,
      setTheme,
      setHasCompletedWizard,
    ]
  );

  // Read file and parse JSON
  const readFile = useCallback((file: File): Promise<ExportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const data = JSON.parse(json);
          resolve(data);
        } catch {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  // Clear all data
  const clearAllData = useCallback(() => {
    clearChildren();
    clearPlans();
    clearETFs();
    clearIncomeYears();
    setHasCompletedWizard(false);
  }, [clearChildren, clearPlans, clearETFs, clearIncomeYears, setHasCompletedWizard]);

  // Get data summary for preview
  const getDataSummary = useCallback((data: ExportData) => {
    return {
      childrenCount: data.children?.length || 0,
      plansCount: data.plans?.length || 0,
      etfsCount: data.etfs?.length || 0,
      contributionsCount: data.contributions?.length || 0,
      incomeYearsCount: data.incomeYears?.length || 0,
      exportedAt: data.exportedAt ? new Date(data.exportedAt).toLocaleString() : 'Unknown',
      version: data.version || 'Unknown',
    };
  }, []);

  return {
    exportToFile,
    validateImportData,
    importData,
    readFile,
    clearAllData,
    generateExportData,
    getDataSummary,
  };
}
