import axios from "axios";
import { GITHUBKeys } from "../../helpers/common";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "fs";
import path from "path";
import { dir as tmpDir } from "tmp-promise";
import logger from "../../logger";

// Bus Factor
interface Contributor {
  username: string;
  contributionCount: number;
}

function calculateBusFactor(contributors: Contributor[]): number {
  if (
    contributors.length === 0 ||
    (contributors.length === 1 && contributors[0].contributionCount > 0)
  ) {
    return 0;
  }

  const totalContributions = contributors.reduce(
    (sum, contributor) => sum + contributor.contributionCount,
    0,
  );
  const threshold = totalContributions * 0.8;
  let countedContributions = 0;
  let majorContributorCount = 0;

  for (const contributor of contributors.sort(
    (a, b) => b.contributionCount - a.contributionCount,
  )) {
    countedContributions += contributor.contributionCount;
    majorContributorCount++;

    if (countedContributions >= threshold) {
      break;
    }
  }

  return Math.min(majorContributorCount / 10, 1);
}

export async function getBusFactor(repoUrl: string): Promise<number> {
  const repoMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);

  if (!repoMatch || repoMatch.length < 2) {
    logger.error(`Invalid GitHub repository URL: ${repoUrl}`);
    process.exit(1);
  }

  const apiUrl = `https://api.github.com/repos/${repoMatch[1]}/contributors`;
  console.info(`Fetching contributors from ${apiUrl}`);

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${GITHUBKeys.accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (response.status !== 200) {
    logger.error(`Failed to fetch data: ${response.statusText}`);
    process.exit(1);
  }

  let contributors: any[];
  try {
    contributors = await response.data;
  } catch (error: any) {
    logger.error(`Error parsing response: ${error.message}`);
    process.exit(1);
  }

  if (
    !Array.isArray(contributors) ||
    !contributors.every((c) => "login" in c && "contributions" in c)
  ) {
    logger.error(`Unexpected response format`);
    process.exit(1);
  }

  const formattedContributors = contributors.map((c) => ({
    username: c.login,
    contributionCount: c.contributions,
  }));

  return calculateBusFactor(formattedContributors);
}

// Correctness

async function fetchGitHubData(
  fullRepoUrl: string,
  endpoint: string,
): Promise<any> {
  const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
  if (!repoUrlMatch) {
    console.info(`Invalid GitHub repository URL:', ${fullRepoUrl}`);
    logger.info(`Invalid GitHub repository URL: ${fullRepoUrl}`);
    process.exit(1);
  }
  const repoUrl = repoUrlMatch[1];
  const apiUrl = `https://api.github.com/${endpoint.replace(
    "OWNER/REPO",
    repoUrl,
  )}`;

  console.info(`Constructed API URL: ${apiUrl}`);

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${GITHUBKeys.accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (response.status !== 200) {
    console.info(
      `Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`,
    );
    logger.info(
      `Failed to fetch data from ${repoUrl}. Status: ${response.statusText}`,
    );
    process.exit(1);
  }

  return await response.data;
}

export async function getCorrectness(repoUrl: string): Promise<number> {
  try {
    const repoUrlMatch = repoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch) {
      console.info(`Invalid GitHub repository URL: ${repoUrl}`);
      logger.info(`Invalid GitHub repository URL: ${repoUrl}`);
      process.exit(1);
    }
    const repoPath = repoUrlMatch[1];

    const repoDetails = await fetchGitHubData(repoUrl, `repos/${repoPath}`);
    const openPRData = await fetchGitHubData(
      repoUrl,
      `search/issues?q=repo:${repoPath}+type:pr+state:open`,
    );
    const closedPRData = await fetchGitHubData(
      repoUrl,
      `search/issues?q=repo:${repoPath}+type:pr+state:closed`,
    );

    let prScore = 0;
    if (closedPRData.total_count + openPRData.total_count > 0) {
      prScore =
        closedPRData.total_count /
        (closedPRData.total_count + openPRData.total_count);
    }
    console.info(`Calculated PR score: ${prScore}`);

    const starsScore = Math.min(repoDetails.stargazers_count / 1000, 1);
    console.info(`Calculated stars score: ${starsScore}`);

    const finalScore = (starsScore + prScore) / 2;
    console.info(`Calculated final score: ${finalScore}`);

    return finalScore;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.info(`Failed to fetch correctness data: ${error.message}`);
      logger.info(`Failed to fetch correctness data: ${error.message}`);
    } else {
      console.info("An unknown error occurred while fetching correctness data");
      logger.info("An unknown error occurred while fetching correctness data");
    }
    process.exit(1);
  }
}

// License

export async function getLicense(url: string): Promise<number> {
  const urlParts = url.split("/");
  const repo = urlParts.pop();
  const owner = urlParts.pop();
  logger.info(`\n Fetching license information for ${owner}/${repo}\n`);
  const apiURL = `https://api.github.com/repos/${owner}/${repo}/license`;
  console.info(`Constructed API URL: ${apiURL}`);

  try {
    const response = await axios.get(apiURL, {
      headers: {
        Authorization: `Bearer ${GITHUBKeys.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 200 && response.data.license) {
      logger.info(`License found: ${response.data.license.spdx_id}`);
      return 1;
    } else {
      logger.info("No license found or license is not recognized.");
      return 0;
    }
  } catch (error: any) {
    logger.error(`Failed to fetch license information: ${error.message}`);
    return 0;
  }
}

// Ramp Up

export async function getRampUp(url: string): Promise<number> {
  let score = 0;
  const { path: tmpPath, cleanup } = await tmpDir({ unsafeCleanup: true });
  console.info(`Cloning ${url} to ${tmpPath}`);
  await git.clone({
    fs,
    http,
    dir: tmpPath,
    url,
    singleBranch: true,
    depth: 1,
  });
  let readme: string | undefined;
  const readmeVariations = [
    "README.md",
    "readme.md",
    "Readme.md",
    "readme.markdown",
  ];

  for (const readmeFile of readmeVariations) {
    try {
      readme = fs.readFileSync(path.join(tmpPath, readmeFile), "utf-8");
      break;
    } catch {
      // If reading fails, continue to the next iteration
      continue;
    }
  }

  if (!readme) {
    console.info("Couldn't find a readable README file locally; Score of 0");
    await cleanup();
    return 0;
  }

  // Calculate ramp up score based on the README content
  const readmeLines = readme.split("\n").length;
  score += 0.2 * Math.min(readmeLines / 200, 1);
  logger.info(`Calculated score based on README length: ${score}`);

  // Keywords score calculation using regex pattern
  const keywordPattern =
    /Installation|Features|Quick Start|Wiki|Guide|Examples/gi;
  const matches = readme.match(keywordPattern);

  const uniqueMatches = matches
    ? new Set(matches.map((match) => match.toLowerCase()))
    : new Set();
  score += Math.min(0.16 * uniqueMatches.size, 0.8);
  logger.info(
    `Found ${uniqueMatches.size} unique keywords in README. Updated score: ${score}`,
  );

  cleanup();
  logger.info(`Temporary directory cleaned up.`);
  return score;
}

// Responsiveness

const ms_to_sec: number = 1000;
const sec_to_hour: number = 3600;
const hours_to_days: number = 24;

function parseDate(dateString: any) {
  return new Date(dateString);
}

async function fetchIssues(owner: string, repo: string): Promise<any[]> {
  const perPage = 100;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&page=1&per_page=${perPage}`;
  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${GITHUBKeys.accessToken}`,
    },
  });

  if (response.status !== 200) {
    console.info(
      `Failed to fetch data from ${repo}. Status: ${response.statusText}`,
    );
    logger.info(
      `Failed to fetch data from ${repo}. Status: ${response.statusText}`,
    );
    process.exit(1);
  }

  const closedIssues = await response.data;
  logger.info(`Fetched ${closedIssues.length} closed issues.`);
  return closedIssues;
}
//Finds the median of the time taken to close an issue
function findMedian(numbers: any) {
  // Step 1: Sort the list
  const sortedNumbers = numbers.slice().sort((a: any, b: any) => a - b);

  const middleIndex = Math.floor(sortedNumbers.length / 2);

  if (sortedNumbers.length % 2 === 0) {
    // Even number of elements, so take the average of the two middle elements
    const middle1 = sortedNumbers[middleIndex - 1];
    const middle2 = sortedNumbers[middleIndex];
    return (middle1 + middle2) / 2;
  } else {
    // Odd number of elements, so the middle element is the median
    return sortedNumbers[middleIndex];
  }
}
export async function getResponsive(url: string): Promise<number> {
  const urlParts = url.split("/");
  const repo: string = urlParts.pop()!;
  const owner: string = urlParts.pop()!;
  const score_list: number[] = [];

  try {
    const issues = await fetchIssues(owner, repo);

    for (const issue of issues) {
      const created = parseDate(issue.created_at);
      const closed = parseDate(issue.closed_at);
      const diff =
        (closed.valueOf() - created.valueOf()) /
        (ms_to_sec * sec_to_hour * hours_to_days); // diff measured in days
      score_list.push(diff);
    }
    const median = findMedian(score_list);
    logger.info(`Calculated median time to close an issue: ${median} days.`);

    if (median < 1) {
      return 1;
    } else if (median > 7) {
      return 0;
    } else {
      // linear interpolation here.
      return 1 - (median - 1) / 6;
    }
  } catch (error) {
    logger.error(`Failed to calculate score of ${repo}. Error: ${error}`);
    process.exit(1);
  }
}

// Good Pinning Practices

async function fetchDependencies(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w-]+)/);
  if (!match) return [];

  const [owner, repo] = [match[1], match[2]];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
  const response = await axios.get(apiUrl, {
    headers: { Accept: "application/vnd.github.v3.raw" },
  });

  logger.info("response", response);

  if (response.status !== 200) {
    logger.error(`Failed to fetch package.json: ${response.statusText}`);
    return [];
  }
  const packageJson = response.data;
  logger.info("packageJson", packageJson);
  return Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }).map(([name, version]) => ({ name, version }));
}

function isPinnedToMajorMinor(version: string) {
  const versionRegex = /^(\d+\.\d+\.\d+|\d+\.\d+\.x)$/;
  return versionRegex.test(version);
}

export async function getGoodPinningPractice(repoUrl: string) {
  const dependencies = await fetchDependencies(repoUrl);
  logger.info("dependencies", dependencies);
  if (dependencies.length === 0) return 1.0;

  const pinnedDependencies = dependencies.filter((dep) =>
    isPinnedToMajorMinor(dep.version as string),
  );
  logger.info("pinnedDependencies", pinnedDependencies);
  return pinnedDependencies.length / dependencies.length;
}

// Pull Request Metric

async function fetchReviewedPullRequests(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w-]+)/);
  if (!match) return [];

  const [owner, repo] = [match[1], match[2]];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100`;

  try {
    const response = await axios.get(apiUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    return response.data.filter(
      (pr: any) => pr.merged_at != null && pr.review_comments > 0,
    );
  } catch (error: any) {
    logger.error(`Error fetching pull requests: ${error.message}`);
    return [];
  }
}

async function calculateTotalContributions(
  pullRequests: any[],
  repoUrl: string,
) {
  let totalLinesOfCode = 0;
  for (const pr of pullRequests) {
    const prDetailUrl = `${repoUrl}/pulls/${pr.number}`;
    try {
      const response = await axios.get(prDetailUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      totalLinesOfCode += response.data.additions + response.data.deletions;
    } catch (error: any) {
      logger.error(`Error fetching PR details: ${error.message}`);
    }
  }
  return totalLinesOfCode;
}

async function fetchTotalProjectCommits(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w-]+)/);
  if (!match) return 0;

  const [owner, repo] = [match[1], match[2]];
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;

  let totalCommits = 0;
  let page = 1;

  while (true) {
    try {
      const response = await axios.get(`${apiUrl}&page=${page}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });

      if (response.data.length === 0) break;

      totalCommits += response.data.length;
      page++;
    } catch (error: any) {
      logger.error(`Error fetching commits: ${error.message}`);
      break;
    }
  }

  return totalCommits;
}

export async function getPullRequest(repoUrl: string) {
  const reviewedPullRequests = await fetchReviewedPullRequests(repoUrl);
  logger.info("reviewedPullRequests", reviewedPullRequests);
  const reviewedContributions = await calculateTotalContributions(
    reviewedPullRequests,
    repoUrl,
  );
  logger.info("reviewedContributions", reviewedContributions);
  const totalProjectCommits = await fetchTotalProjectCommits(repoUrl);
  logger.info("totalProjectCommits", totalProjectCommits);

  if (totalProjectCommits === 0) return 0;

  return reviewedContributions / totalProjectCommits;
}
