import assert from "node:assert/strict";
import test from "node:test";

import {
  RequestValidationError,
  STORAGE_KEY,
  appendRequest,
  createRequest,
  filterRequestsByPriority,
  loadRequests,
  saveRequests,
} from "../src/request-store.js";

const validInput = {
  requester: "  Jordan Lee  ",
  department: "Operations",
  equipment: "  Laptop  ",
  neededBy: "2026-09-15",
  reason: "  Replace a failed field computer.  ",
};

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("createRequest trims input and adds system fields", () => {
  const request = createRequest(validInput, {
    id: "request-1",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  assert.deepEqual(request, {
    id: "request-1",
    requester: "Jordan Lee",
    department: "Operations",
    equipment: "Laptop",
    priority: "Normal",
    neededBy: "2026-09-15",
    reason: "Replace a failed field computer.",
    createdAt: "2026-08-17T12:00:00.000Z",
  });
});

test("createRequest reports missing required fields", () => {
  assert.throws(
    () => createRequest({ ...validInput, requester: "", equipment: " " }),
    (error) => {
      assert.ok(error instanceof RequestValidationError);
      assert.deepEqual(Object.keys(error.errors), ["requester", "equipment"]);
      return true;
    },
  );
});

test("appendRequest returns a new list with the newest request first", () => {
  const original = [{ id: "old" }];
  const result = appendRequest(original, { id: "new" });

  assert.deepEqual(result.map((request) => request.id), ["new", "old"]);
  assert.deepEqual(original.map((request) => request.id), ["old"]);
});

test("saveRequests and loadRequests round-trip valid records", () => {
  const storage = new MemoryStorage();
  const request = createRequest(validInput, {
    id: "request-2",
    now: new Date("2026-08-17T12:00:00.000Z"),
  });

  saveRequests([request], storage);

  assert.deepEqual(loadRequests(storage), [request]);
});

test("loadRequests safely handles damaged stored data", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "not-json");

  assert.deepEqual(loadRequests(storage), []);
});

test("each priority is preserved when creating and storing requests", () => {
  const storage = new MemoryStorage();
  const requests = ["Low", "Normal", "High"].map((priority) =>
    createRequest({ ...validInput, priority }),
  );

  assert.deepEqual(requests.map((request) => request.priority), ["Low", "Normal", "High"]);
  saveRequests(requests, storage);
  assert.deepEqual(loadRequests(storage), requests);
});

test("createRequest rejects unsupported priorities", () => {
  for (const priority of ["Urgent", "", "high", 42]) {
    assert.throws(
      () => createRequest({ ...validInput, priority }),
      (error) => {
        assert.ok(error instanceof RequestValidationError);
        assert.deepEqual(error.errors, {
          priority: "Select Low, Normal, or High priority.",
        });
        return true;
      },
    );
  }
});

test("older requests without priority load as Normal without losing data", () => {
  const storage = new MemoryStorage();
  const legacyRequest = {
    id: "legacy-request",
    requester: "Jordan Lee",
    department: "Operations",
    equipment: "Laptop",
    neededBy: "2026-09-15",
    reason: "Replace a failed field computer.",
    createdAt: "2026-08-17T12:00:00.000Z",
  };
  storage.setItem(STORAGE_KEY, JSON.stringify([legacyRequest]));

  const requests = loadRequests(storage);
  assert.deepEqual(requests, [{ ...legacyRequest, priority: "Normal" }]);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), [legacyRequest]);
  saveRequests(requests, storage);
  assert.deepEqual(loadRequests(storage), requests);
});

test("priority filtering preserves order and ignores status", () => {
  const requests = [
    { id: "high-1", priority: "High", status: "Closed" },
    { id: "low", priority: "Low" },
    { id: "normal", priority: "Normal" },
    { id: "high-2", priority: "High", status: "Open" },
  ];
  const original = structuredClone(requests);

  assert.deepEqual(filterRequestsByPriority(requests, "All"), original);
  assert.deepEqual(filterRequestsByPriority(requests, "High").map(({ id }) => id), ["high-1", "high-2"]);
  assert.deepEqual(filterRequestsByPriority(requests, "Normal").map(({ id }) => id), ["normal"]);
  assert.deepEqual(filterRequestsByPriority(requests, "Low").map(({ id }) => id), ["low"]);
  assert.deepEqual(requests, original);
});

test("priority filtering returns an empty list when nothing matches", () => {
  assert.deepEqual(filterRequestsByPriority([{ priority: "Low" }], "High"), []);
  for (const priority of ["All", "High", "Normal", "Low"]) {
    assert.deepEqual(filterRequestsByPriority([], priority), []);
  }
});

test("filtering loaded legacy requests never writes to storage", () => {
  const storage = new MemoryStorage();
  const legacyRequest = createRequest(validInput, { id: "legacy" });
  delete legacyRequest.priority;
  const stored = JSON.stringify([legacyRequest]);
  storage.setItem(STORAGE_KEY, stored);
  const requests = loadRequests(storage);

  for (const priority of ["All", "Normal", "High", "Low", "All"]) {
    const matches = filterRequestsByPriority(requests, priority);
    assert.equal(matches.length, ["All", "Normal"].includes(priority) ? 1 : 0);
    assert.equal(storage.getItem(STORAGE_KEY), stored);
  }
  assert.equal(requests[0].priority, "Normal");
});

test("adding requests while filtering preserves all saved requests", () => {
  const storage = new MemoryStorage();
  let requests = [createRequest({ ...validInput, priority: "Low" }, { id: "old" })];
  const oldRequest = structuredClone(requests[0]);
  for (const [id, priority] of [["matching", "High"], ["nonmatching", "Normal"]]) {
    requests = appendRequest(requests, createRequest({ ...validInput, priority }, { id }));
    saveRequests(requests, storage);
    assert.deepEqual(filterRequestsByPriority(requests, "High").map(({ id }) => id), ["matching"]);
  }
  assert.deepEqual(loadRequests(storage), requests);
  assert.deepEqual(filterRequestsByPriority(requests, "All").map(({ id }) => id), ["nonmatching", "matching", "old"]);
  assert.deepEqual(requests[2], oldRequest);
});
