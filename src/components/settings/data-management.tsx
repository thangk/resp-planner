'use client';

import { useState, useRef, useMemo } from 'react';
import { Download, Upload, Trash2, HardDrive, FileJson, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useExportImport } from '@/hooks/use-export-import';
import type { ExportData } from '@/types';

export function DataManagement() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Trigger recalculation of storage usage
  const [storageVersion, setStorageVersion] = useState(0);

  const {
    exportToFile,
    validateImportData,
    importData: doImport,
    readFile,
    clearAllData,
    getDataSummary,
  } = useExportImport();

  // Calculate localStorage usage using useMemo
  const storageUsage = useMemo(() => {
    // storageVersion is used to trigger recalculation
    void storageVersion;
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length * 2; // UTF-16 uses 2 bytes per character
        }
      }
      // Typical localStorage limit is 5-10MB
      const limit = 5 * 1024 * 1024; // 5MB estimate
      return { used: total, total: limit };
    } catch {
      return null;
    }
  }, [storageVersion]);

  const recalculateStorage = () => setStorageVersion((prev) => prev + 1);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExport = () => {
    try {
      const filename = exportToFile();
      toast.success(`Data exported to ${filename}`);
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readFile(file);
      const validation = validateImportData(data);

      if (!validation.valid) {
        setImportErrors(validation.errors);
        setImportData(null);
      } else {
        setImportErrors([]);
        setImportData(data);
      }

      setImportDialogOpen(true);
    } catch {
      toast.error('Failed to read file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (!importData) return;

    try {
      doImport(importData, importMode);
      toast.success(
        importMode === 'replace' ? 'All data replaced successfully' : 'Data merged successfully'
      );
      setImportDialogOpen(false);
      setImportData(null);
      recalculateStorage();
    } catch {
      toast.error('Failed to import data');
    }
  };

  const handleClearAll = () => {
    clearAllData();
    toast.success('All data cleared');
    recalculateStorage();
  };

  const summary = importData ? getDataSummary(importData) : null;
  const usagePercentage = storageUsage
    ? Math.min((storageUsage.used / storageUsage.total) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export, import, or clear your data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        {storageUsage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="text-muted-foreground h-4 w-4" />
                <Label>Storage Usage</Label>
              </div>
              <span className="text-muted-foreground text-sm">
                {formatBytes(storageUsage.used)} / ~{formatBytes(storageUsage.total)}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {usagePercentage > 80 && (
              <p className="flex items-center gap-1 text-xs text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                Storage is getting full. Consider exporting and clearing old data.
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* Export / Import */}
        <div className="space-y-3">
          <Label>Backup & Restore</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Export your data to a JSON file for backup. Import to restore or transfer data.
          </p>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-3">
          <Label className="text-destructive">Danger Zone</Label>
          <p className="text-muted-foreground text-sm">
            Clearing all data will permanently remove all your children, plans, portfolio, and
            settings. Export your data first if you want to keep a backup.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your data including children, plans, portfolio
                  settings, income records, and app preferences. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Import Data
              </DialogTitle>
              <DialogDescription>Review the data before importing.</DialogDescription>
            </DialogHeader>

            {importErrors.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
                  <p className="text-destructive mb-2 text-sm font-medium">Invalid file format</p>
                  <ul className="text-destructive/80 list-inside list-disc space-y-1 text-sm">
                    {importErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Data Preview */}
                <div className="bg-muted space-y-2 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Valid export file (v{summary.version})</span>
                  </div>
                  <p className="text-muted-foreground text-xs">Exported on {summary.exportedAt}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                    <span className="text-sm">Children</span>
                    <Badge variant="secondary">{summary.childrenCount}</Badge>
                  </div>
                  <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                    <span className="text-sm">Plans</span>
                    <Badge variant="secondary">{summary.plansCount}</Badge>
                  </div>
                  <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                    <span className="text-sm">ETFs</span>
                    <Badge variant="secondary">{summary.etfsCount}</Badge>
                  </div>
                  <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                    <span className="text-sm">Contributions</span>
                    <Badge variant="secondary">{summary.contributionsCount}</Badge>
                  </div>
                </div>

                {/* Import Mode */}
                <div className="space-y-3">
                  <Label>Import Mode</Label>
                  <RadioGroup
                    value={importMode}
                    onValueChange={(v) => setImportMode(v as 'replace' | 'merge')}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="replace" id="replace" className="mt-1" />
                      <div>
                        <Label htmlFor="replace" className="font-medium">
                          Replace all data
                        </Label>
                        <p className="text-muted-foreground text-xs">
                          Clear existing data and import from file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="merge" id="merge" className="mt-1" />
                      <div>
                        <Label htmlFor="merge" className="font-medium">
                          Merge with existing
                        </Label>
                        <p className="text-muted-foreground text-xs">
                          Add new items, skip duplicates
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport}>
                    {importMode === 'replace' ? 'Replace Data' : 'Merge Data'}
                  </Button>
                </DialogFooter>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
