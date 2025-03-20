import AdmZip from 'adm-zip';
import fetch from 'node-fetch';

export async function downloadAndExtractReportFiles(
  reportId: string,
  entitiesFilesUrl: string,
  demandScoreFilesUrl: string): Promise<{
    entitiesFiles: { path: string; files: string[]; };
    demandScoreFiles: { path: string; files: string[]; };
  }> {
  // Download files
  const entitiesFile = await fetch(entitiesFilesUrl, { method: 'GET' });
  const demandScoreFile = await fetch(demandScoreFilesUrl, { method: 'GET' });

  // Create temp directory
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  const tempDir = path.join(os.tmpdir(), 'mcp-audiense-demand');
  await fs.mkdir(tempDir, { recursive: true });

  // Extract files
  const reportTempDir = path.join(tempDir, reportId);
  await fs.mkdir(reportTempDir, { recursive: true });

  const entitiesFilesZip = new AdmZip(Buffer.from(await entitiesFile.arrayBuffer()));
  const demandScoreFilesZip = new AdmZip(Buffer.from(await demandScoreFile.arrayBuffer()));

  entitiesFilesZip.extractAllTo(reportTempDir, true);
  demandScoreFilesZip.extractAllTo(reportTempDir, true);

  // Get file lists
  const entitiesFilesList = entitiesFilesZip.getEntries().map(entry => entry.entryName);
  const demandScoreFilesList = demandScoreFilesZip.getEntries().map(entry => entry.entryName);

  return {
    entitiesFiles: {
      path: reportTempDir,
      files: entitiesFilesList
    },
    demandScoreFiles: {
      path: reportTempDir,
      files: demandScoreFilesList
    }
  };
}
