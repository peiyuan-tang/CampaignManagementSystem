import { supabase } from './supabaseClient';
import { Campaign } from '../types';

export const CampaignService = {
  /**
   * Fetches all campaigns from the 'campaigns' table.
   */
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }

    // Map snake_case DB columns to camelCase TypeScript interface if needed.
    // Assuming the DB columns match the keys in our types or we map them here.
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      budget: row.budget,
      adTextContent: row.ad_text_content,
      adImageContent: row.ad_image_content, // This will now store the URL
      keywords: row.keywords || [],
      semanticDescription: row.semantic_description,
      reviewPolicy: row.review_policy,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },

  /**
   * Uploads an image file to Supabase Storage bucket 'campaign-assets'.
   */
  async uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  /**
   * Inserts a new campaign into the database.
   */
  async createCampaign(campaign: Campaign): Promise<Campaign> {
    // Transform to snake_case for DB
    const dbPayload = {
      id: campaign.id,
      name: campaign.name,
      budget: campaign.budget,
      ad_text_content: campaign.adTextContent,
      ad_image_content: campaign.adImageContent, // URL or Base64
      keywords: campaign.keywords,
      semantic_description: campaign.semanticDescription,
      review_policy: campaign.reviewPolicy,
      created_at: new Date(campaign.createdAt).toISOString()
    };

    const { data, error } = await supabase
      .from('campaigns')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }

    return campaign;
  }
};