export interface Database {
  public: {
    Tables: {
      albums: {
        Row: {
          id: string
          title: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          owner_id?: string
          created_at?: string
        }
      }
      album_members: {
        Row: {
          id: string
          album_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          album_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          user_id?: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          album_id: string
          uploader_id: string
          file_path: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          uploader_id: string
          file_path: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          uploader_id?: string
          file_path?: string
          file_url?: string
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          album_id: string
          token: string
          created_by: string
          expired_at: string
          used_count: number
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          token: string
          created_by: string
          expired_at: string
          used_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          token?: string
          created_by?: string
          expired_at?: string
          used_count?: number
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
