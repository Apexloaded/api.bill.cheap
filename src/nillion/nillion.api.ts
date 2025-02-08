import { Injectable } from '@nestjs/common';
import { AuthConfig } from './types/org.type';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NillionApi {
  constructor(private http: HttpService) {}

  async post<T>(path: string, payload: any, authConfig: AuthConfig) {
    return await Promise.all(
      Object.entries(authConfig).map(async ([name, config]) => {
        const headers = {
          Authorization: `Bearer ${config.jwt}`,
          'Content-Type': 'application/json',
        };
        const url = new URL(`/api/v1/${path}`, config.url).toString();
        try {
          const response = await this.http.axiosRef.post(
            url,
            JSON.stringify(payload),
            {
              headers,
            },
          );
          if (response.status !== 200) {
            throw new Error(
              `Failed to create schema on ${name}: ${response.status} ${response.statusText}`,
            );
          }

          const data = response.data;
          if (data.errors && data.errors.length > 0) {
            throw new Error(
              `Failed to create schema on ${name}: ${data.errors
                .map((error: any) => error.message)
                .join(', ')}`,
            );
          }

          return data as T;
        } catch (error) {
          console.error(`Error creating schema on ${name}:`, error.message);
          throw error;
        }
      }),
    );
  }

  async getApi(path: string, authConfig: AuthConfig) {
    return await Promise.all(
      Object.entries(authConfig).map(async ([name, config]) => {
        const headers = {
          Authorization: `Bearer ${config.jwt}`,
          'Content-Type': 'application/json',
        };
        const url = new URL(`/api/v1/${path}`, config.url).toString();
        try {
          const response = await this.http.axiosRef.get(url, {
            headers,
          });
          if (response.status !== 200) {
            throw new Error(
              `Failed to read schema on ${name}: ${response.status} ${response.statusText}`,
            );
          }

          const data = response.data;
          if (data.errors && data.errors.length > 0) {
            throw new Error(
              `Failed to read schema on ${name}: ${data.errors
                .map((error: any) => error.message)
                .join(', ')}`,
            );
          }

          return data;
        } catch (error) {
          console.error(`Error reading schema on ${name}:`, error.message);
          throw error;
        }
      }),
    );
  }
}
