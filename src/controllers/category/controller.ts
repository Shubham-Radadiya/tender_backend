import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  createCategory,
  deleteCategoryById,
  getCategory,
  getCategoryById,
  ICategory,
  Category,
  updateCategory,
} from "../../modules/category";

export default class Controller {
  private readonly createCategorySchema = Joi.object({
    name: Joi.string().required(),
  });

  private readonly updateCategorySchema = Joi.object({
    name: Joi.string().optional(),
  });

  protected readonly getCategory = async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.id;
      if (categoryId) {
        const category = await getCategoryById(categoryId);
        res.status(200).json({ message: "Category Listed", category });
        return;
      }
      const categoryList = await getCategory();
      res.status(200).json({ message: "Category Listed", categoryList });
      return;
    } catch (error) {
      console.log("Error in getCategory", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createCategory = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: ICategory = await this.createCategorySchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }

      const newCategory = await createCategory(
        new Category({ ...payloadValue })
      );
      res.status(201).json(newCategory);
      return;
    } catch (error) {
      console.log("Error in createCategory", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateCategory = async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: ICategory = await this.updateCategorySchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }
      const existingCategory = await getCategoryById(categoryId);
      if (!existingCategory) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      const updated = await updateCategory(
        new Category({ ...existingCategory, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateCategory", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteCategory = async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.id;
      const existingCategory = await getCategoryById(categoryId);
      if (!existingCategory) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      await deleteCategoryById(categoryId);
      res.status(200).json({ message: "Category deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteCategory", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
