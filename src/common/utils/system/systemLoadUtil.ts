import os from "os";
import logger from "@/common/utils/logging/logger";

export interface SystemLoadOptions {
  cpuThreshold?: number; // CPU usage threshold (0-1)
  memoryThreshold?: number; // Memory usage threshold (0-1)
  checkInterval?: number; // How often to check load (ms)
  cooldownPeriod?: number; // How long to wait after high load before rechecking (ms)
}

export interface SystemLoadMetrics {
  cpuUsage: number;
  memoryUsage: number;
  isHighLoad: boolean;
  lastChecked: Date;
}

class SystemLoadUtil {
  private static instance: SystemLoadUtil;
  private cpuThreshold: number;
  private memoryThreshold: number;
  private lastCheck: number = 0;
  private checkInterval: number;
  private cooldownPeriod: number;
  private isHighLoad: boolean = false;
  private currentCpuUsage: number = 0;
  private currentMemoryUsage: number = 0;
  private highLoadStartTime: number = 0;

  private constructor(options: SystemLoadOptions = {}) {
    this.cpuThreshold = options.cpuThreshold || 0.8; // 80% CPU usage
    this.memoryThreshold = options.memoryThreshold || 0.9; // 90% memory usage
    this.checkInterval = options.checkInterval || 10000; // 10 seconds
    this.cooldownPeriod = options.cooldownPeriod || 60000; // 1 minute cooldown after high load
  }

  public static getInstance(options?: SystemLoadOptions): SystemLoadUtil {
    if (!SystemLoadUtil.instance) {
      SystemLoadUtil.instance = new SystemLoadUtil(options);
    }
    return SystemLoadUtil.instance;
  }

  public async isSystemOverloaded(): Promise<boolean> {
    const now = Date.now();

    // If we're in high load state and still in cooldown period, return true without rechecking
    if (this.isHighLoad && now - this.highLoadStartTime < this.cooldownPeriod) {
      return true;
    }

    // Only check if enough time has passed since last check
    if (now - this.lastCheck > this.checkInterval) {
      this.lastCheck = now;

      try {
        // Check CPU usage
        this.currentCpuUsage = await this.getCpuUsage();

        // Check memory usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        this.currentMemoryUsage = (totalMem - freeMem) / totalMem;

        // Update high load status
        const wasHighLoad = this.isHighLoad;
        this.isHighLoad =
          this.currentCpuUsage > this.cpuThreshold ||
          this.currentMemoryUsage > this.memoryThreshold;

        // If we just entered high load state, record the time
        if (!wasHighLoad && this.isHighLoad) {
          this.highLoadStartTime = now;
        }

        if (this.isHighLoad) {
          logger.warn(
            `System under high load: CPU ${(this.currentCpuUsage * 100).toFixed(
              1
            )}%, Memory ${(this.currentMemoryUsage * 100).toFixed(1)}%`
          );
        } else if (wasHighLoad) {
          // Log recovery from high load
          logger.info(
            `System recovered from high load: CPU ${(
              this.currentCpuUsage * 100
            ).toFixed(1)}%, Memory ${(this.currentMemoryUsage * 100).toFixed(
              1
            )}%`
          );
        }
      } catch (error) {
        logger.error("Error checking system load:", error);
        // Default to false if we can't check
        this.isHighLoad = false;
      }
    }

    return this.isHighLoad;
  }

  /**
   * Get current system load metrics
   */
  public getLoadMetrics(): SystemLoadMetrics {
    return {
      cpuUsage: this.currentCpuUsage,
      memoryUsage: this.currentMemoryUsage,
      isHighLoad: this.isHighLoad,
      lastChecked: new Date(this.lastCheck),
    };
  }

  /**
   * Force reset high load state and check again immediately
   */
  public async resetHighLoadState(): Promise<boolean> {
    this.isHighLoad = false;
    this.lastCheck = 0; // Reset last check time to force immediate recheck
    return this.isSystemOverloaded();
  }

  private async getCpuUsage(): Promise<number> {
    // Get initial CPU measurements
    const startMeasure = os.cpus().map((cpu) => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0),
    }));

    // Wait a bit to measure difference
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get second CPU measurements
    const endMeasure = os.cpus().map((cpu) => ({
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0),
    }));

    // Calculate CPU usage across all cores
    const idleDifferences = startMeasure.map((start, i) => {
      const end = endMeasure[i];
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      return 1 - idleDiff / totalDiff;
    });

    // Average CPU usage across all cores
    return (
      idleDifferences.reduce((sum, idle) => sum + idle, 0) /
      idleDifferences.length
    );
  }
}

export default SystemLoadUtil.getInstance();
