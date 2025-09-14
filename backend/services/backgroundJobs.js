// Background job handler for long-running Ollama requests
const axios = require('axios');

class BackgroundJobManager {
  constructor() {
    this.jobs = new Map();
    this.jobIdCounter = 1;
  }

  createJob(type, data) {
    const jobId = `job_${Date.now()}_${this.jobIdCounter++}`;
    const job = {
      id: jobId,
      type,
      status: 'pending',
      data,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };

    this.jobs.set(jobId, job);

    // Start processing in background (don't await)
    this.processJob(jobId);

    return jobId;
  }

  async processJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      console.log(`Starting background job ${jobId} of type ${job.type}`);

      switch (job.type) {
        case 'generate-specification':
          job.result = await this.generateSpecification(job.data);
          break;
        case 'generate-prd':
          job.result = await this.generatePRD(job.data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      console.log(`Completed background job ${jobId}`);

    } catch (error) {
      console.error(`Error in background job ${jobId}:`, error);
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date().toISOString();
    }

    // Clean up old jobs after 1 hour
    setTimeout(() => {
      this.jobs.delete(jobId);
    }, 3600000);
  }

  async generateSpecification(data) {
    const { prompt, model = 'mistral:7b-instruct' } = data;

    console.log('Generating specification in background...');
    console.log('Prompt length:', prompt.length);

    // No timeout - let it run as long as needed
    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 8192  // Allow longer responses for specifications
      }
    }, {
      // No timeout specified - will run until completion
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Specification generated, length:', response.data.response?.length);
    return response.data.response;
  }

  async generatePRD(data) {
    const { prompt, model = 'mistral:7b-instruct' } = data;

    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 4096
      }
    }, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return response.data.response;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      id: job.id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      hasResult: !!job.result,
      resultLength: job.result ? job.result.length : 0
    };
  }

  getJobResult(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    if (job.status === 'completed') {
      return {
        success: true,
        result: job.result
      };
    } else if (job.status === 'failed') {
      return {
        success: false,
        error: job.error
      };
    } else {
      return {
        success: false,
        status: job.status,
        message: 'Job still processing'
      };
    }
  }

  getAllJobs() {
    const jobs = [];
    for (const [id, job] of this.jobs) {
      jobs.push({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      });
    }
    return jobs;
  }

  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending' || job.status === 'processing') {
      job.status = 'cancelled';
      job.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// Singleton instance
const jobManager = new BackgroundJobManager();

module.exports = jobManager;