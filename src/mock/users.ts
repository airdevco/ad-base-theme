import type { User } from "@/types";

const firstNames = [
  "Jane", "John", "Lisa", "Marcus", "Sarah", "David", "Emily", "Alex",
  "Rachel", "Omar", "Sofia", "James", "Mia", "Daniel", "Olivia", "Ethan",
  "Ava", "Noah", "Isabella", "Liam", "Charlotte", "Lucas", "Amelia", "Mason",
  "Harper", "Logan", "Ella", "Jack", "Scarlett", "Henry", "Grace", "Owen",
  "Chloe", "Samuel", "Lily", "Sebastian", "Zoey", "Caleb", "Nora", "Ryan",
  "Hannah", "Nathan", "Aria", "Dylan", "Layla", "Gabriel", "Riley", "Matthew",
  "Penelope", "Leo",
];

const lastNames = [
  "Smith", "Doe", "Chen", "Johnson", "Williams", "Kim", "Garcia", "Patel",
  "Thompson", "Hassan", "Rodriguez", "Martinez", "Anderson", "Taylor",
  "Thomas", "Moore", "Jackson", "Martin", "Lee", "White", "Harris", "Clark",
  "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott",
  "Green", "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Perez",
  "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards",
  "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed",
];

const roles: User["role"][] = ["admin", "member"];
const statuses: User["status"][] = ["active", "inactive", "pending"];

// Seeded PRNG to avoid hydration mismatches between server and client
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateUsers(count: number): User[] {
  const users: User[] = [];
  const rand = createSeededRandom(42);

  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(2, "0");
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const role = i < 8 ? (i % 4 === 0 ? "admin" : "member") : roles[Math.floor(rand() * roles.length)];
    const status =
      i < 5
        ? "active"
        : statuses[Math.floor(rand() * statuses.length)];

    const startMs = new Date("2023-06-01").getTime();
    const endMs = new Date("2025-12-01").getTime();
    const createdAt = new Date(startMs + rand() * (endMs - startMs)).toISOString();

    const loginEndMs = new Date("2026-03-01").getTime();
    const createdMs = new Date(createdAt).getTime();
    const lastLoginAt =
      status === "pending"
        ? null
        : new Date(createdMs + rand() * (loginEndMs - createdMs)).toISOString();

    users.push({
      id: `usr_${idx}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 49 ? i : ""}@agency.com`,
      firstName,
      lastName,
      avatarUrl: null,
      role,
      status,
      createdAt,
      lastLoginAt,
    });
  }

  return users;
}

export const mockUsers: User[] = generateUsers(100);
