#!/usr/bin/env bash
# Full-scale tournament driver: 10 authors x 8 structures x 10 cases.
# Resumable — every step is cached, so re-running skips completed work.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
export PYTHONUNBUFFERED=1
LOG=scripts/run_full.log
echo "=== $(date -u) START full run ===" | tee -a "$LOG"

echo "--- generate imps (all authors, all structures) ---" | tee -a "$LOG"
python3 scripts/generate_imps.py 2>&1 | tee -a "$LOG"

echo "--- tournament (full 800 rewrites) ---" | tee -a "$LOG"
python3 scripts/run_tournament.py 2>&1 | tee -a "$LOG"

echo "--- evals (full 800) ---" | tee -a "$LOG"
python3 scripts/run_evals.py 2>&1 | tee -a "$LOG"

echo "--- analysis ---" | tee -a "$LOG"
python3 scripts/analyze_results.py 2>&1 | tee -a "$LOG"

echo "=== $(date -u) DONE full run ===" | tee -a "$LOG"
