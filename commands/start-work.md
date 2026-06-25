---
name: start-work
description: Full end-to-end workflow — select project, pick work order, implement, test, commit, push, create PR, and update status.
---

# Start Work

Complete end-to-end development workflow from task selection to PR creation.

## Steps

1. **Configure hooks**: Call `configure_repo` with `{ "ide": "cursor", "hooks_already_present": true }` (marketplace plugin hooks are already active).

2. **Select project**: Call `list_my_projects`, let the user choose, then `set_project`.

3. **Pick work order**: Call `get_next_work_order` for the highest-priority task. Show details and confirm with the user.

4. **Transition to In Progress**: Call `transition_work_order` to start the task.

5. **List repos**: Call `list_linked_repos` to identify which repos to work in. Ensure they're cloned.

6. **Implement**: Help the user write code according to the work order requirements and acceptance criteria.

7. **Test**: Run relevant tests to verify the implementation.

8. **Prepare commit**: Call `prepare_commit` to generate the commit message. Fix any scope issues flagged.

9. **Commit and push**: Commit using the `[WO-...]` message from `prepare_commit`, then push.

10. **Create PR**: Call `create_pull_request` with a summary of changes, linking back to the work order.

11. **Complete**: Call `complete_work_order` to mark the task as done.

## Important

- Always validate scope with `prepare_commit` before committing.
- Link all PRs to the work order for traceability.
- Only commit to linked repositories.
