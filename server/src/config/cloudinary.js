import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL in the server environment.",
    );
  }

  cloudinary.config({
    secure: true,
  });

  return cloudinary;
}

export function uploadAvatarToCloudinary(buffer) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({
      url: "https://res.cloudinary.com/test/image/upload/test-avatar.png",
      publicId: "test-avatar",
    });
  }

  const client = configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: "my-task-manager/avatars",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url || !result.public_id) {
          return reject(new Error("Cloudinary returned an invalid upload result."));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteAvatarFromCloudinary(publicId) {
  if (!publicId || process.env.NODE_ENV === "test") return;
  const client = configureCloudinary();
  await client.uploader.destroy(publicId, { resource_type: "image" });
}
